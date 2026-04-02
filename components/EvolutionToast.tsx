import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, BounceIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/constants/theme';
import { HeaderSheep } from './HeaderSheep';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EvolutionToastProps = {
  stageName: string;
  onDismiss: () => void;
};

export function EvolutionToast({ stageName, onDismiss }: EvolutionToastProps) {
  const { colors: C, isDark } = useTheme();

  return (
    <View style={styles.overlay}>
      <Animated.View 
        entering={FadeInUp.springify().damping(15)}
        exiting={FadeOutDown}
        style={[
          styles.toast, 
          { 
            backgroundColor: C.bgCard,
            shadowColor: isDark ? '#000' : C.accent,
          }
        ]}
      >
        <Animated.View entering={BounceIn.delay(300)} style={styles.mascotContainer}>
          <HeaderSheep size={60} />
        </Animated.View>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Yohoo!</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            Your mascot evolved to{'\n'}
            <Text style={{ color: C.accent, fontWeight: '900' }}>{stageName}</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: C.accent }]} 
          onPress={onDismiss}
        >
          <Text style={styles.buttonText}>Got it!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mascotContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: tokens.fonts.heading,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: tokens.fonts.heading,
    fontSize: 16,
    fontWeight: '800',
  },
});
