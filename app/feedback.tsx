import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { tokens } from '@/constants/theme';
import { useFeedback, CATEGORIES, Feedback, BAD_WORDS_REGEX } from '@/hooks/useFeedback';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';

// --- Icons ---
const BackIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UpvoteIcon = ({ color, filled }: { color: string; filled: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path d="M12 19V5M5 12l7-7 7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DownvoteIcon = ({ color, filled }: { color: string; filled: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path d="M12 5v14M19 12l-7 7-7-7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);



// --- Components ---

const FeedbackCard = ({ 
  item, 
  onVote
}: { 
  item: Feedback; 
  onVote: (id: string, type: number) => void;
}) => {
  const C = useColors();
  const { isDark } = useTheme();

  const handleUpvote = () => onVote(item.id, 1);
  const handleDownvote = () => onVote(item.id, -1);

  return (
    <Animated.View 
      entering={FadeInUp} 
      layout={Layout.springify()}
      style={[
        styles.card, 
        { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : C.bgCard,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#EEE' 
        }
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(139, 109, 174, 0.2)' : C.accentLight }]}>
            <Text style={[styles.categoryText, { color: C.accent }]}>{item.category.toUpperCase()}</Text>
          </View>
          <Text style={[styles.dateText, { color: C.textMuted }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.feedbackText, { color: C.textPrimary }]}>{item.content}</Text>
      </View>

      <View style={styles.voteContainer}>
        <TouchableOpacity onPress={handleUpvote} style={styles.voteBtn}>
          <UpvoteIcon 
            color={item.user_vote === 1 ? C.accent : C.textMuted} 
            filled={item.user_vote === 1} 
          />
        </TouchableOpacity>
        
        <Text style={[
          styles.scoreText, 
          { color: item.score > 0 ? C.accent : item.score < 0 ? '#D4928A' : C.textMuted }
        ]}>
          {item.score}
        </Text>

        <TouchableOpacity onPress={handleDownvote} style={styles.voteBtn}>
          <DownvoteIcon 
            color={item.user_vote === -1 ? '#D4928A' : C.textMuted} 
            filled={item.user_vote === -1} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};


export default function FeedbackScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();
  const { feedbacks, loading, refreshing, fetchFeedbacks, submitFeedback, voteFeedback } = useFeedback();

  const [modalVisible, setModalVisible] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<'top' | 'latest'>('top');

  const sortedFeedbacks = React.useMemo(() => {
    return [...feedbacks].sort((a, b) => {
      if (filterType === 'top') {
        return b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [feedbacks, filterType]);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;

    if (BAD_WORDS_REGEX.test(newContent)) {
      Alert.alert(
        "Oops! Let's keep it clean ✨",
        "Hateful language or profanity was identified and it is not accepted. Please be gentle and use constructive feedback in this life! 💛"
      );
      return;
    }

    setSubmitting(true);
    const result = await submitFeedback(newContent, selectedCategory);
    setSubmitting(false);
    if (result.success) {
      setNewContent('');
      setModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bgPrimary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.maxWidthWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0EBE3' }]}
              onPress={() => router.back()}
            >
              <BackIcon color={C.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: C.textPrimary }]}>Feedback Board</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.explainerContainer}>
            <Text style={[styles.explainerText, { color: C.textSecondary }]}>
              Help shape Rizzze! Share your ideas, report bugs, or upvote features you want to see next. Everything is anonymous.
            </Text>
          </View>

          {/* Filter Toggle */}
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterBtn, 
                { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                filterType === 'top' && { backgroundColor: C.accent }
              ]}
              onPress={() => setFilterType('top')}
            >
              <Text style={[styles.filterBtnText, { color: filterType === 'top' ? '#FFF' : C.textSecondary }]}>Top Voted</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.filterBtn, 
                { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                filterType === 'latest' && { backgroundColor: C.accent }
              ]}
              onPress={() => setFilterType('latest')}
            >
              <Text style={[styles.filterBtnText, { color: filterType === 'latest' ? '#FFF' : C.textSecondary }]}>Latest</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={C.accent} size="large" />
            </View>
          ) : (
            <FlatList
              data={sortedFeedbacks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FeedbackCard 
                  item={item} 
                  onVote={voteFeedback} 
                />
              )}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchFeedbacks(true)} tintColor={C.accent} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>No feedback yet. Be the first!</Text>
                </View>
              }
            />
          )}

          {/* Floating Action Button - Contained within maxWidthWrapper relative context or handled via absolute */}
          <View style={styles.fabWrapper}>
            <TouchableOpacity 
              style={[styles.fab, { backgroundColor: C.accent }]}
              onPress={() => setModalVisible(true)}
            >
              <PlusIcon color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: C.textPrimary }]}>New Feedback</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: C.textMuted }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: C.textSecondary }]}>Category</Text>
              <View style={styles.categoryPicker}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity 
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.catOption,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' },
                      selectedCategory === cat && { backgroundColor: C.accent }
                    ]}
                  >
                    <Text style={[
                      styles.catOptionText,
                      { color: C.textSecondary },
                      selectedCategory === cat && { color: '#FFF', fontFamily: 'Nunito_700Bold' }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: C.textSecondary }]}>Your Suggestion</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F9F9F9',
                    color: C.textPrimary,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#EEE'
                  }
                ]}
                placeholder="What can we improve?"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={6}
                value={newContent}
                onChangeText={setNewContent}
                autoFocus
              />

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: C.accent }, !newContent.trim() && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={submitting || !newContent.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Post Anonymously</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  maxWidthWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: tokens.layout.contentMaxWidth,
    alignSelf: 'center',
  },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: tokens.fonts.heading,
    fontSize: 20,
  },
  explainerContainer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    paddingTop: 4,
  },
  explainerText: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    ...tokens.shadows.card,
  },
  cardContent: { flex: 1, marginRight: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Nunito_800ExtraBold',
  },
  dateText: {
    fontSize: 11,
    fontFamily: tokens.fonts.body,
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: tokens.fonts.body,
    lineHeight: 22,
  },
  voteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    gap: 4,
  },
  voteBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: 100,
    pointerEvents: 'box-none',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevated,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: tokens.fonts.heading,
    fontSize: 22,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    marginBottom: 12,
    marginTop: 16,
  },
  categoryPicker: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  catOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  catOptionText: {
    fontSize: 13,
    fontFamily: tokens.fonts.body,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    fontFamily: tokens.fonts.body,
    borderWidth: 1,
    marginTop: 8,
  },
  submitBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  }
});
