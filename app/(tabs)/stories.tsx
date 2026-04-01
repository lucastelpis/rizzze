import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { useAudio } from '@/context/AudioContext';
import { BottomNav } from '@/components/BottomNav';
import { AwakeSheep } from '@/components/AwakeSheep';
import * as StoryGraphics from '@/components/StoryGraphics';
import { CATEGORIES, STORIES } from '@/constants/stories';
import { getDailyPick } from '@/utils/dailyPicks';

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
  const { activeSound } = useAudio();

  // Use deterministic daily pick for stories
  const featuredStory = React.useMemo(() => getDailyPick(STORIES), []);
  // Helper to get story thumb component
  const StoryThumb = (StoryGraphics as any)[featuredStory.id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Thumb'];

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
            style={[styles.sheepButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.accentLight }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <AwakeSheep size={34} />
          </TouchableOpacity>
        </View>
        <View style={[styles.headerDivider, { backgroundColor: C.border }]} />

        <Animated.View 
          entering={FadeIn.duration(400)}
          style={{ flex: 1 }}
        >
          <ScrollView 
            style={styles.scroll} 
            contentContainerStyle={[styles.scrollContent, activeSound && { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          >

          
          <TouchableOpacity 
            style={[styles.featuredCard, { backgroundColor: C.bgCard, borderTopColor: '#C8A29A', shadowColor: C.textPrimary }]}
            activeOpacity={0.9}
            onPress={() => router.push(`/reader/${featuredStory.id}`)}
          >
            <View style={styles.featuredContent}>
              <View style={[styles.thumbWrap, { backgroundColor: 'rgba(240, 216, 208, 0.15)' }]}>
                {StoryThumb ? <StoryThumb size={52} /> : <AwakeSheep size={42} />}
              </View>
              
              <View style={styles.featuredText}>
                <Text style={[styles.overline, { color: '#8B4A40', marginBottom: 2 }]}>TONIGHT'S READ</Text>
                <Text style={[styles.featuredTitle, { color: C.textPrimary }]}>{featuredStory.title}</Text>
                <Text style={[styles.featuredSubtitle, { color: '#9E7E78' }]} numberOfLines={1}>
                  {featuredStory.subtitle}
                </Text>
              </View>
              
              <View style={[styles.playButton, { backgroundColor: '#8B4A40' }]}>
                <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                  <Path d="M4 2.5L13 8L4 13.5V2.5Z" fill="#FFFFFF" />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>

          {/* CATEGORIES SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
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
            </View>
          </ScrollView>
        </Animated.View>


        <BottomNav active="stories" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 24 },
  
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
  },
  headerDivider: {
    height: 1,
    width: '100%',
  },

  section: { gap: 12 },
  sectionHeader: { },
  overline: { 
    fontFamily: tokens.fonts.caption, 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 1.1 // 0.1em 
  },

  featuredCard: {
    borderRadius: 20,
    borderTopWidth: 3,
    padding: 16,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 8,
  },
  featuredContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumbWrap: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: { flex: 1, gap: 2 },
  featuredTitle: { fontFamily: tokens.fonts.caption, fontSize: 15, fontWeight: '800' },
  featuredSubtitle: { fontFamily: tokens.fonts.body, fontSize: 12, fontWeight: '500' },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
