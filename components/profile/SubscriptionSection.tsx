import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { posthog } from '@/config/posthog';
import RevenueCatUI from 'react-native-purchases-ui';
import { SettingsItem, ChevronRight } from './SettingsItem';

interface SubscriptionSectionProps {
  onReplayTour?: () => void;
}

export const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ onReplayTour }) => {
  const { isPro, isLoading, presentPaywall, restorePurchases } = useSubscription();
  const { isDark } = useTheme();
  const C = useColors();

  const handleSubscriptionPress = async () => {
    if (isPro) {
      await RevenueCatUI.presentCustomerCenter();
    } else {
      await presentPaywall();
    }
  };

  return (
    <View style={[styles.section, { marginBottom: 16 }]}>
      <Text style={[styles.sectionTitle, { color: C.textMuted }]}>SUBSCRIPTION, SUPPORT & FEEDBACK</Text>
      
      <View style={[styles.settingsFlatItem, { borderBottomColor: C.border }]}>
        <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>Subscription</Text>
        <TouchableOpacity 
          style={styles.badgeWrapper} 
          onPress={handleSubscriptionPress} 
          disabled={isLoading}
        >
          <View style={[styles.proBadge, {
            backgroundColor: isPro
              ? (isDark ? 'rgba(139, 109, 174, 0.2)' : '#EDE5F5')
              : (isDark ? 'rgba(255,255,255,0.08)' : '#F0EDE8')
          }]}>
            <Text style={[styles.proBadgeText, { color: isPro ? '#8B6DAE' : C.textSecondary }]}>
              {isLoading ? '...' : isPro ? 'Rizzze Pro' : 'Free'}
            </Text>
          </View>
          <ChevronRight />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.settingsFlatItem, { borderBottomColor: C.border }]}
        onPress={() => {
          posthog.capture('restore_purchases_tapped');
          restorePurchases();
        }}
      >
        <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>Restore purchases</Text>
      </TouchableOpacity>

      <SettingsItem label="Support" onPress={() => {}} /* Handled by parent router push */ />
      <SettingsItem label="Feedback" onPress={() => {}} /* Handled by parent router push */ />
      
      {onReplayTour && (
        <SettingsItem
          label="Replay app tour"
          showChevron={false}
          last
          onPress={onReplayTour}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsFlatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  settingsLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  proBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
