import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { useUser } from '@/context/UserContext';

export interface Feedback {
  id: string;
  category: string;
  content: string;
  created_at: string;
  user_id?: string;
  score: number;
  user_vote: number; // 1, -1, or 0
}

export const CATEGORIES = ['Feature Request', 'Bug Report', 'General'];

export const BAD_WORDS_REGEX = new RegExp(`\\b(fuck\\w*|shit\\w*|bitch\\w*|asshole\\w*|cunt\\w*|dick\\w*|nigg\\w*|faggot\\w*|slut\\w*|whore\\w*|retard\\w*|pussy\\w*|bastard\\w*|kys)\\b|(kill yourself|go die|die for it)`, 'i');

export function useFeedback() {
  const { userId: guestId } = useUser();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(guestId);

  // Sync the effective userId with auth state
  useEffect(() => {
    const getEffectiveId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || guestId);
    };
    getEffectiveId();
  }, [guestId]);

  const fetchFeedbacks = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Get all feedbacks
      const { data: fbData, error: fbError } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fbError) throw fbError;

      // 2. Get all votes to calculate scores
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('feedback_id, vote, user_id');

      if (votesError) throw votesError;

      // 3. Process data (filter profanity first)
      const cleanFbData = (fbData || []).filter(fb => !BAD_WORDS_REGEX.test(fb.content));

      const processed: Feedback[] = cleanFbData.map((fb) => {
        const fbVotes = (votesData || []).filter(v => v.feedback_id === fb.id);
        const score = fbVotes.reduce((acc, v) => acc + (v.vote || 0), 0);
        const userVote = fbVotes.find(v => v.user_id === userId)?.vote || 0;

        return {
          ...fb,
          score,
          user_vote: userVote,
        };
      });

      // Sort by score (desc), then created_at (desc)
      processed.sort((a, b) => b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFeedbacks(processed);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFeedbacks();
    }
  }, [userId, fetchFeedbacks]);

  const submitFeedback = async (content: string, category: string) => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([{ content, category, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      const newFb: Feedback = { ...data, score: 0, user_vote: 0 };
      setFeedbacks(prev => [newFb, ...prev].sort((a, b) => b.score - a.score));
      return { success: true };
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return { success: false, error: err };
    }
  };

  const voteFeedback = async (feedbackId: string, voteType: number) => {
    // Optimistic UI update
    const previousFeedbacks = [...feedbacks];
    setFeedbacks(current => {
      return current.map(fb => {
        if (fb.id === feedbackId) {
          const oldVote = fb.user_vote;
          const newVote = oldVote === voteType ? 0 : voteType; // Toggle
          const scoreDiff = newVote - oldVote;
          return { ...fb, user_vote: newVote, score: fb.score + scoreDiff };
        }
        return fb;
      }).sort((a, b) => b.score - a.score);
    });

    try {
      const currentFb = feedbacks.find(f => f.id === feedbackId);
      const oldVote = currentFb?.user_vote || 0;
      const newVote = oldVote === voteType ? 0 : voteType;

      if (newVote === 0) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .match({ feedback_id: feedbackId, user_id: userId });
        if (error) throw error;
      } else {
        // Upsert vote
        const { error } = await supabase
          .from('votes')
          .upsert({ feedback_id: feedbackId, user_id: userId, vote: newVote }, { onConflict: 'feedback_id, user_id' });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error voting:', err);
      setFeedbacks(previousFeedbacks); // Rollback
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .delete()
        .match({ id, user_id: userId })
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Not deleted by database. Likely missing DELETE RLS policy.');
      }

      setFeedbacks(prev => prev.filter(fb => fb.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting feedback:', err);
      // Wait to notify user or handle error state
      return { success: false, error: err };
    }
  };

  return {
    feedbacks,
    loading,
    refreshing,
    fetchFeedbacks,
    submitFeedback,
    voteFeedback,
    deleteFeedback,
    currentUserId: userId,
  };
}
