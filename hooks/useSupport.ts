import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useUser } from '@/context/UserContext';
import * as Device from 'expo-device';

export type TicketCategory = 'question' | 'bug' | 'feature' | 'billing' | 'other';

export interface SupportTicket {
  id: string;
  user_id: string;
  contact_email: string | null;
  category: TicketCategory;
  content: string;
  response: string | null;
  status: 'open' | 'closed' | 'answered';
  created_at: string;
  device_info?: any;
}

export function useSupport() {
  const { userId: guestId, email } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUserId(user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentId = authUserId || guestId;

  const fetchTickets = useCallback(async () => {
    if (!currentId) return;
    setLoading(true);
    try {
      // Fetch for both IDs to ensure nothing is lost during migration
      const query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (authUserId && guestId && authUserId !== guestId) {
        query.or(`user_id.eq.${authUserId},user_id.eq.${guestId}`);
      } else {
        query.eq('user_id', currentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [currentId, authUserId, guestId]);

  const submitTicket = useCallback(async (category: TicketCategory, message: string) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: currentId,
          contact_email: user?.email || email || null,
          category,
          content: message,
          device_info: {
            brand: Device.brand,
            model: Device.modelName,
            os: Device.osName,
            os_version: Device.osVersion,
            platform: Platform.OS
          },
          status: 'open'
        });

      if (error) throw error;
      await fetchTickets(); // Refresh list
      return { success: true };
    } catch (err) {
      console.error('Failed to submit support ticket:', err);
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentId, email, fetchTickets]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    isSubmitting,
    fetchTickets,
    submitTicket
  };
}
