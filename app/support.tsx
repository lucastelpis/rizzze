import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { tokens } from '@/constants/theme';
import { useSupport, TicketCategory, SupportTicket } from '@/hooks/useSupport';
import { Sparkle } from '@/components/SheepMascot';
import Animated, { FadeInUp, FadeIn, Layout, FadeInDown } from 'react-native-reanimated';

// --- Icons ---
const BackIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StaffIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M12 8v4" />
    <Path d="M12 16h.01" />
  </Svg>
);

// --- CATEGORIES ---
const CATEGORIES: { id: TicketCategory; label: string }[] = [
  { id: 'question', label: 'Question' },
  { id: 'bug', label: 'Bug Report' },
  { id: 'feature', label: 'Idea' },
  { id: 'billing', label: 'Billing/Pro' },
  { id: 'other', label: 'Other' },
];

const SupportTicketCard = ({ ticket }: { ticket: SupportTicket }) => {
  const C = useColors();
  const { isDark } = useTheme();

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
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(139, 109, 174, 0.2)' : C.accentLight }]}>
          <Text style={[styles.categoryText, { color: C.accent }]}>{ticket.category.toUpperCase()}</Text>
        </View>
        <Text style={[styles.dateText, { color: C.textMuted }]}>
          {new Date(ticket.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={[styles.feedbackText, { color: C.textPrimary }]}>{ticket.content}</Text>

      {/* Answer Section */}
      <View style={[
        styles.answerContainer, 
        { 
          backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : C.bgMuted,
          borderLeftColor: ticket.response ? C.accent : C.textMuted
        }
      ]}>
        <View style={styles.answerHeader}>
          <StaffIcon color={ticket.response ? C.accent : C.textMuted} />
          <Text style={[styles.answerLabel, { color: ticket.response ? C.accent : C.textSecondary }]}>
            {ticket.response ? 'OFFICIAL RESPONSE' : 'STATUS: EVALUATING'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <Text style={[styles.answerText, { color: ticket.response ? C.textPrimary : C.textSecondary }]}>
            {ticket.response || 'Our support team will evaluate your inquiry and return to you asap!'}
          </Text>
          {!ticket.response && <Sparkle size={14} color={C.accent} />}
        </View>
      </View>
    </Animated.View>
  );
};

export default function SupportCenterScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();
  const { tickets, loading, fetchTickets, submitTicket } = useSupport();

  const [modalVisible, setModalVisible] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>('question');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!newContent.trim() || newContent.length < 10) {
      Alert.alert("Message too short", "Please provide a bit more detail (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    const result = await submitTicket(selectedCategory, newContent);
    setSubmitting(false);
    if (result.success) {
      setNewContent('');
      setModalVisible(false);
    } else {
      Alert.alert("Error", "Failed to send ticket. Please try again.");
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
            <Text style={[styles.title, { color: C.textPrimary }]}>Support Center</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.explainerContainer}>
            <Text style={[styles.explainerText, { color: C.textSecondary }]}>
              Have a question or a problem? Send us a private message and we'll get back to you personally.
            </Text>
          </View>

          {loading && !refreshing ? (
            <View style={styles.center}>
              <ActivityIndicator color={C.accent} size="large" />
            </View>
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SupportTicketCard ticket={item} />}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                    No support tickets yet. Click the plus sign in the right side of the footer to start one!
                  </Text>
                </View>
              }
            />
          )}

          {/* Floating Action Button */}
          <TouchableOpacity 
            style={[styles.fab, { backgroundColor: C.accent }]}
            onPress={() => setModalVisible(true)}
          >
            <PlusIcon color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Submit Modal */}
        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <Animated.View entering={FadeInDown} style={[styles.modalContent, { backgroundColor: C.bgCard }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Send Request</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Text style={[styles.closeBtnText, { color: C.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: C.textMuted }]}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catBtn,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : C.bgMuted },
                      selectedCategory === cat.id && { backgroundColor: C.accent }
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.catBtnText, { color: selectedCategory === cat.id ? '#FFF' : C.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.inputLabel, { color: C.textMuted }]}>YOUR MESSAGE</Text>
              <TextInput
                style={[
                  styles.textInput, 
                  { 
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : C.bgMuted, 
                    color: C.textPrimary,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#EEE'
                  }
                ]}
                placeholder="What's going on? Be specific if possible..."
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={6}
                value={newContent}
                onChangeText={setNewContent}
              />

              <TouchableOpacity 
                style={[
                  styles.submitBtn, 
                  { backgroundColor: C.accent },
                  (!newContent.trim() || submitting) && { opacity: 0.6 }
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Ticket</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  maxWidthWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: tokens.layout.contentMaxWidth,
    alignSelf: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: tokens.fonts.heading,
    fontWeight: '800',
  },
  explainerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  explainerText: {
    fontSize: 14,
    fontFamily: tokens.fonts.body,
    lineHeight: 20,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    ...tokens.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: tokens.fonts.heading,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 12,
    fontFamily: tokens.fonts.caption,
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: tokens.fonts.body,
    lineHeight: 22,
    marginBottom: 16,
  },
  answerContainer: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 11,
    fontFamily: tokens.fonts.heading,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 14,
    fontFamily: tokens.fonts.body,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: tokens.fonts.body,
    fontSize: 15,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevated,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: tokens.layout.contentMaxWidth,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: tokens.fonts.heading,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontFamily: tokens.fonts.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: tokens.fonts.heading,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  catScroll: {
    marginBottom: 24,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  catBtnText: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    fontFamily: tokens.fonts.body,
    lineHeight: 24,
    marginBottom: 24,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  submitBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.card,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: tokens.fonts.heading,
    fontWeight: '800',
  },
});
