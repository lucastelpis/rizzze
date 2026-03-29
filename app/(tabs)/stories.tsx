import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { BottomNav } from '@/components/BottomNav';
import { SleepingSheep } from '@/components/SleepingSheep';
import * as StoryGraphics from '@/components/StoryGraphics';
import { CATEGORIES, STORIES } from '@/constants/stories';

// Chevron Right
const ChevronRight = ({ color = '#C4AED8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function StoriesScreen() {
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();

  // Pick "The tea master's morning" as the featured story for Screen 1
  const featuredStory = STORIES.find(s => s.id === 'the-tea-masters-morning') || STORIES[0];

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: C.textPrimary }]}>Stories</Text>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>Short reads to quiet your mind</Text>
          </View>
          <TouchableOpacity 
            style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight, borderColor: 'rgba(139, 107, 174, 0.15)' }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <SleepingSheep size={34} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TONIGHT'S READ */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.overline, { color: C.textSecondary }]}>TONIGHT'S READ</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.featuredCard, { backgroundColor: C.bgCard, shadowColor: C.textPrimary }]}
            activeOpacity={0.9}
            onPress={() => router.push(`/reader/${featuredStory.id}`)}
          >
            <View style={styles.featuredContent}>
              <View style={styles.thumbWrap}>
                <StoryGraphics.TheTeaMastersMorningThumb size={52} />
              </View>
              
              <View style={styles.featuredText}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: C.accentLight }]}>
                    <Text style={[styles.badgeText, { color: C.accent }]}>Cozy</Text>
                  </View>
                  <Text style={[styles.readTime, { color: C.textMuted }]}>{featuredStory.readTime}</Text>
                </View>
                <Text style={[styles.featuredTitle, { color: C.textPrimary }]}>{featuredStory.title}</Text>
                <Text style={[styles.featuredSubtitle, { color: C.textSecondary }]} numberOfLines={1}>
                  {featuredStory.subtitle}
                </Text>
              </View>
              
              <ChevronRight color="#C4AED8" />
            </View>
          </TouchableOpacity>

          {/* CATEGORIES GRID */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.overline, { color: C.textSecondary }]}>CATEGORIES</Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const Graphic = (StoryGraphics as any)[`${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}CategoryBg`];
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/story-list/${cat.id}`)}
                >
                  <View style={styles.graphicWrap}>
                    {Graphic && <Graphic />}
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text 
                      style={[styles.catSubtitle, { color: cat.accentColor }]}
                      numberOfLines={2}
                    >
                      {cat.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <BottomNav active="stories" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  
  header: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { 
    fontFamily: tokens.fonts.heading, 
    fontSize: 28, 
    fontWeight: '900', 
    letterSpacing: -0.5 // -0.02em
  },
  subtitle: { 
    fontFamily: 'Nunito_600SemiBold', 
    fontSize: 15, 
    fontWeight: '600', 
    marginTop: -2 
  },
  sheepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  sectionHeader: { marginBottom: 12 },
  overline: { 
    fontFamily: tokens.fonts.caption, 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 1.1 // 0.1em 
  },

  featuredCard: {
    borderRadius: 20,
    borderTopWidth: 3,
    borderTopColor: '#8B6DAE',
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  featuredContent: { flexDirection: 'row', alignItems: 'center' },
  thumbWrap: { width: 52, height: 52, borderRadius: 14, overflow: 'hidden' },
  featuredText: { flex: 1, marginLeft: 14, marginRight: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  badgeText: { fontFamily: 'Nunito_700Bold', fontSize: 10, fontWeight: '700' },
  readTime: { fontFamily: 'Nunito_600SemiBold', fontSize: 10, fontWeight: '600', marginLeft: 8 },
  featuredTitle: { fontFamily: tokens.fonts.caption, fontSize: 15, fontWeight: '800' },
  featuredSubtitle: { fontFamily: tokens.fonts.body, fontSize: 12, fontWeight: '500' },

  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    rowGap: 12 
  },
  categoryCard: { 
    width: '48%', 
    height: 160, 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  graphicWrap: { ...StyleSheet.absoluteFillObject },
  categoryInfo: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 16, 
    paddingBottom: 12 
  },
  catTitle: { 
    fontFamily: tokens.fonts.caption, 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#F5F0E8' 
  },
  catSubtitle: { 
    fontFamily: 'Nunito_600SemiBold', 
    fontSize: 11, 
    fontWeight: '600', 
    marginTop: 2,
    lineHeight: 14,
  },
});
