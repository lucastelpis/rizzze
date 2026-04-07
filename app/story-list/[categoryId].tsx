import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { useUser } from '@/context/UserContext';
import { BottomNav } from '@/components/BottomNav';
import * as StoryGraphics from '@/components/StoryGraphics';
import { CATEGORIES, STORIES, Story, getCategoryStoryCount } from '@/constants/stories';
import { AwakeSheep } from '@/components/AwakeSheep';
import { HeaderSheep } from '@/components/HeaderSheep';
import { MiniPlayer } from '@/components/MiniPlayer';

// Chevron Left (Back)
const BackChevron = ({ color = '#7A7589' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Chevron Right
const ChevronRight = ({ color = '#A9A3B5' }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function StoryListScreen() {
  const { categoryId } = useLocalSearchParams();
  const { isDark } = useTheme();
  const C = useColors();
  const router = useRouter();
  const { readStoryIds } = useUser();

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[1]; // Default to folklore for mockup
  const categoryStories = STORIES.filter(s => s.category === category.id);
  const featuredStory = categoryStories[0];

  const renderStoryItem = ({ item, index }: { item: Story, index: number }) => {
    // Dynamically get the thumb graphic
    const ThumbGraphic = (StoryGraphics as any)[`${item.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).charAt(0).toUpperCase() + item.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).slice(1)}Thumb`];

    return (
      <TouchableOpacity 
        style={styles.storyRow}
        onPress={() => router.push(`/reader/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.rowInner}>
          <View style={styles.listThumb}>
            {ThumbGraphic ? <ThumbGraphic size={56} /> : <View style={[styles.placeholderThumb, { backgroundColor: C.bgMuted }]} />}
          </View>
          <View style={styles.storyMeta}>
            <View style={styles.titleRow}>
              <Text style={[styles.storyTitle, { color: C.textPrimary }]}>{item.title}</Text>
              {readStoryIds.includes(item.id) && (
                <View style={[styles.readBadgeList, { backgroundColor: isDark ? 'rgba(139, 109, 174, 0.35)' : '#EDE5F5' }]}>
                  <Text style={[styles.readBadgeTextList, { color: isDark ? '#D6C8E5' : C.accent }]}>READ</Text>
                </View>
              )}
            </View>
            <View style={styles.metaLine}>
              <Text style={[styles.originTag, { color: C.textSecondary }]}>{item.origin}</Text>
              <Text style={[styles.dot, { color: '#E8E2D8' }]}>·</Text>
              <Text style={[styles.readTimeTag, { color: C.accent }]}>{item.readTime}</Text>
            </View>
          </View>
          <ChevronRight color="#A9A3B5" />
        </View>
        {index < categoryStories.length - 1 && <View style={[styles.divider, { backgroundColor: '#E8E2D8' }]} />}
      </TouchableOpacity>
    );
  };

  const CategoryGraphic = (StoryGraphics as any)[`${category.id.charAt(0).toUpperCase() + category.id.slice(1)}CategoryBg`];

  return (
    <View style={[styles.root, { backgroundColor: C.bgPrimary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0EBE3' }]}
            onPress={() => router.back()}
          >
            <BackChevron color={isDark ? C.white : '#7A7589'} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <Text style={[styles.categoryTitle, { color: C.textPrimary }]}>{category.title}</Text>
            <Text style={[styles.categorySubtitle, { color: C.textSecondary }]}>
              {category.subtitle} · {getCategoryStoryCount(category.id)}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.sheepBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EDE5F5' }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <HeaderSheep size={34} />
          </TouchableOpacity>
        </View>
        <View style={[styles.headerDivider, { backgroundColor: C.border }]} />

        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* FEATURED STORY CARD */}
          <TouchableOpacity 
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/reader/${featuredStory.id}`)}
          >
            <View style={styles.featuredGraphicWrap}>
              {CategoryGraphic && <CategoryGraphic />}
            </View>
            <View style={styles.featuredInfo}>
              <View style={styles.badgeRow}>
                <View style={[styles.pill, { backgroundColor: 'rgba(139,109,174,0.7)' }]}>
                  <Text style={styles.pillTextFeatured}>Featured</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: 'rgba(245,240,232,0.12)' }]}>
                  <Text style={[styles.pillTextTime, { color: '#C4AED8' }]}>{featuredStory.readTime}</Text>
                </View>
                {readStoryIds.includes(featuredStory.id) && (
                  <View style={[styles.pill, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                    <Text style={[styles.pillTextFeatured, { color: '#FFFFFF' }]}>READ</Text>
                  </View>
                )}
              </View>
              <Text style={styles.featuredStoryTitle}>{featuredStory.title}</Text>
              <Text style={[styles.featuredStorySubtitle, { color: '#C4AED8' }]}>
                {featuredStory.origin} · {featuredStory.subtitle}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ALL STORIES LIST */}
          <View style={styles.listHeader}>
            <Text style={[styles.overline, { color: C.textSecondary }]}>ALL STORIES</Text>
          </View>

          <View style={styles.flatListContainer}>
            {categoryStories.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderStoryItem({ item, index })}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>

        <BottomNav active="stories" />
        <MiniPlayer />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 24, marginTop: 12 },
  backButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topBarText: { flex: 1, marginLeft: 16 },
  sheepBtn: {
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
  categoryTitle: { fontFamily: tokens.fonts.heading, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  categorySubtitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, fontWeight: '600', marginTop: -2 },

  featuredCard: { height: 160, borderRadius: 20, overflow: 'hidden', marginBottom: 28 },
  featuredGraphicWrap: { ...StyleSheet.absoluteFillObject },
  featuredInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  pillTextFeatured: { fontFamily: 'Nunito_700Bold', fontSize: 10, fontWeight: '700', color: '#F5F0E8' },
  pillTextTime: { fontFamily: 'Nunito_600SemiBold', fontSize: 10, fontWeight: '600' },
  featuredStoryTitle: { fontFamily: tokens.fonts.caption, fontSize: 17, fontWeight: '800', color: '#F5F0E8' },
  featuredStorySubtitle: { fontFamily: tokens.fonts.body, fontSize: 12, fontWeight: '500' },

  listHeader: { marginBottom: 12 },
  overline: { 
    fontFamily: tokens.fonts.caption, 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 1.1 
  },

  flatListContainer: { marginTop: 4 },
  storyRow: { width: '100%' },
  rowInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  listThumb: { width: 56, height: 56, borderRadius: 14, overflow: 'hidden' },
  placeholderThumb: { width: 56, height: 56, borderRadius: 14 },
  storyMeta: { flex: 1, marginLeft: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readBadgeList: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  readBadgeTextList: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storyTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, fontWeight: '700' },
  metaLine: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  originTag: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, fontWeight: '600' },
  readTimeTag: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, fontWeight: '600' },
  dot: { marginHorizontal: 4, fontWeight: '900' },
  divider: { height: 1, width: '100%' },
});
