import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { ProfileContent } from '@/components/ProfileContent';
import { useTourContext } from '@/context/TourContext';

// Back Chevron Icon
const BackChevron = ({ color = '#7A7589' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();
  const { replay: replayTour } = useTourContext();

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Bar - Always visible in the stack version */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0EBE3' }]}
            onPress={() => router.back()}
          >
            <BackChevron color={isDark ? C.white : '#7A7589'} />
          </TouchableOpacity>
        </View>

        <ProfileContent isModal={true} onReplayTour={replayTour} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
