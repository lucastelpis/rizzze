import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { SettingsItem } from './SettingsItem';

const CloudIconSync = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5C17.5 6.5 14.5 4 11 4 7.7 4 5 6.7 5 10c-2.2.3-4 2.2-4 4.5C1 17 3 19 5.5 19h12z" />
    <Path d="M9 13l2 2 4-4" />
  </Svg>
);

const MailIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

// We'll use a local Polyline for MailIcon if needed
import { Polyline } from 'react-native-svg';

interface BackupSectionProps {
  isEmailVerified: boolean;
  linkedEmail: string | null;
  unlinkEmail: () => Promise<boolean>;
  setShowEmailModal: (val: boolean) => void;
  setShowRestoreModal: (val: boolean) => void;
  isSyncing: boolean;
}

export const BackupSection: React.FC<BackupSectionProps> = ({
  isEmailVerified,
  linkedEmail,
  unlinkEmail,
  setShowEmailModal,
  setShowRestoreModal,
  isSyncing
}) => {
  const { isDark } = useTheme();
  const C = useColors();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.textMuted }]}>ACCOUNT & BACKUP</Text>
      
      {isEmailVerified ? (
        <View style={[styles.settingsFlatItem, { borderBottomColor: C.border, paddingBottom: 16 }]}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <View style={[styles.syncStatusHeader, { width: '100%', justifyContent: 'space-between' }]}>
              <View style={[styles.syncBadge, { backgroundColor: isDark ? 'rgba(74, 139, 86, 0.15)' : '#DDF0E1' }]}>
                <CloudIconSync size={16} color={isDark ? '#6CC17D' : '#356B3F'} />
                <Text style={[styles.syncBadgeText, { color: isDark ? '#6CC17D' : '#356B3F' }]}>Cloud Sync Active</Text>
              </View>
              <TouchableOpacity onPress={() => {
                Alert.alert("Remove Cloud Sync?", "Your current data is safe, but future progress won't be backed up.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: unlinkEmail }
                ]);
              }}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.settingsLabel, { color: C.textPrimary, marginTop: 8 }]}>{linkedEmail}</Text>
            <Text style={[styles.settingsSublabel, { color: C.textSecondary, marginTop: 4 }]}>Your progress is automatically saved.</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.settingsFlatItem, { borderBottomColor: C.border, paddingBottom: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingsLabel, { color: C.textPrimary }]}>Cloud Backup</Text>
            <Text style={[styles.settingsSublabel, { color: C.textSecondary, marginTop: 4, marginBottom: 16 }]}>
              Link an email to protect your progress if you lose your phone.
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: C.accent }]}
              onPress={() => setShowEmailModal(true)}
              disabled={isSyncing}
            >
              <MailIcon color="#FFF" />
              <Text style={styles.actionBtnText}>Link Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SettingsItem
        label="Restore Progress"
        onPress={() => setShowRestoreModal(true)}
      />
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
  settingsSublabel: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  syncBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  removeText: {
    color: '#D4928A',
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
