# CLAUDE.md — Rizzze

**Rizzze** is a React Native (Expo) sleep/relaxation app targeting iOS & Android.

## Commands
```bash
npx expo start          # Dev server
npx expo lint           # Lint
node ./scripts/generate-narrations.mjs  # Rebuild narration asset map
```
No test suite. Verify by running on device/simulator.

## Routing (`expo-router`, file-based)
```
app/index.tsx                   → Onboarding (8-screen flow)
app/(tabs)/index.tsx            → Home hub
app/(tabs)/sounds.tsx           → Sound library
app/(tabs)/sleep.tsx            → Sleep tracking dashboard
app/(tabs)/stories.tsx          → Stories by category
app/(tabs)/games.tsx            → Games hub
app/player.tsx                  → Full-screen audio player (fullScreenModal)
app/profile.tsx                 → Profile (delegates to ProfileContent.tsx)
app/feedback.tsx                → Community ideas/voting board
app/support.tsx                 → Support ticket submission
app/games/cozy-farm.tsx         → Cozy Farm puzzle game
app/games/sheep-jumper.tsx      → Sheep Jumper endless runner
app/reader/[storyId].tsx        → Story reader with narration
app/story-list/[categoryId].tsx → Stories filtered by category
```

## State Management (8 Context Providers)
All in `context/`, persisted via `AsyncStorage`. Registered in `app/_layout.tsx`.

| Context | Responsibility |
|---|---|
| `UserContext` | Identity: name, email, goal, age, gender, readStoryIds |
| `AudioContext` | Dual-player looping, virtual progress timer, playback state |
| `SheepGrowthContext` | Mascot stages, points, pet/feed cooldowns |
| `SleepContext` | Daily quality ratings keyed by date |
| `StreakContext` | Active streak + last-7-days display |
| `ThemeContext` | Dark/light mode (persisted) |
| `NotificationContext` | Bedtime/wake-up push notifications, permission handling |
| `SubscriptionContext` | RevenueCat `isPro` state, paywall presentation |

Provider order: `PostHogProvider → ThemeProvider → UserProvider → SubscriptionProvider → NavigationThemeProvider → SheepGrowthProvider → StreakProvider → SleepProvider → AudioProvider → NotificationProvider`

## Onboarding (`app/index.tsx`)
8 pages, Next/Back nav. Pages: Welcome → Features → Goal (4 options) → Name (15 char) → Age (4 ranges) → Gender (4 options) → Sleep schedule + notification toggles → Meet your sheep. On finish: saves to `UserContext`, calls `posthog.identify()`, presents RevenueCat paywall. Pro users skip onboarding.

## Audio System (`context/AudioContext.tsx`)
- **Dual-player ping-pong**: Two `expo-audio` players alternate to achieve seamless looping. When player A is ~1.2s from end, player B loads and starts.
- **Virtual progress**: `setInterval` at 50ms drives UI — native position polling caused jank.
- **Durations**: `simple_*` sounds = 60s, all others = 300s (hardcoded in `SOUND_DURATIONS`).

## Content

**Sounds** (`constants/sounds.ts`): 6 scenes — Forest night, Ocean shore, City rain, Fireplace, Birdsong fields, Cozy café. Each has a `bgColor`/`gradient` used to theme the full-screen player.

**Stories**: 40 narrated stories across 4 categories (Cozy, Folklore, Reflective, Wonder). Metadata in `constants/stories.ts`. MP3 files mapped in `constants/narrationAssets.ts` under `assets/audio/narration/<category>/`. Read tracking: `markStoryAsRead(storyId)` fires at 95% progress or narration end; a READ badge shows on story cards.

**Games**: Hub loads personal bests on focus from AsyncStorage. Both games stop ambient audio and play their own looping MP3 track. High scores persisted in AsyncStorage.
- **Sheep Jumper** (endless runner): Tap to jump a fence. `requestAnimationFrame` physics loop (not React state). Score +1/fence, speed increases every 10. Key: `rizzze_highscore_sheepjumper`.
- **Cozy Farm** (tap puzzle): 5×5/5×6 grid. Match tool to obstacle (Pick→Stone, Axe→Tree, Trimmer→Grass). 3 obstacle tiers (1/2/3 taps) unlock on levels 5 and 8. Infinite levels. Key: `rizzze_highscore_cozyfarm`.

## Sheep Growth System (`context/SheepGrowthContext.tsx`)
6 stages: Tiny Lamb (0 pts) → Small Lamb (7) → Young Sheep (21) → Adult Sheep (45) → Fluffy Elder (80) → Golden Sheep (130). Points: sleep rating +1, streak day +2, pet +1 (12h cooldown), feed +1 (12h cooldown). Stage change triggers `EvolutionToast`.

## Other Systems
- **Subscription** (`SubscriptionContext`): RevenueCat, entitlement `"Rizzze Pro"`. `presentPaywall()` uses native RevenueCat UI.
- **Cloud backup** (`hooks/useBackup.ts`): Supabase `user_profiles` table. Auth via Supabase OTP email. Backs up: name, goal, age, gender, sheep data, streak, sleep, notifications, readStoryIds. Guest→authed data migration on email link. `SyncObserver.tsx` triggers silent background syncs.
- **Notifications** (`NotificationContext`): Two toggles — Bedtime nudge & Morning check-in. Messages randomized from `constants/notifications.ts`. Permission only requested when leaving onboarding page 6 with a toggle enabled.
- **Community**: Feedback board (`feedback.tsx`, `useFeedback.ts`) + support tickets (`support.tsx`, `useSupport.ts`), both backed by Supabase.

## Analytics (PostHog)
Config in `config/posthog.ts` via `expo-constants`. `PostHogProvider` wraps entire app with session replay. Screen tracking via `posthog.screen(pathname)` in `_layout.tsx`. Key events: `onboarding_started/completed`, `onboarding_goal/name/age/gender_selected`, `notifications_setup_completed`, `paywall_shown`, `subscription_started`, `sound_played`, `story_opened`, `story_reading_started`, `sleep_rating_submitted`, `sheep_petted/fed/evolved`, `game_started`, `data_backed_up`, `email_linked/unlinked`.

## Design System
- **Font**: Nunito (400–900) via `@expo-google-fonts/nunito`
- **Accent**: `#8B6DAE` (lavender/purple), cream backgrounds
- **Tokens**: `constants/theme.ts` — always use these, never hardcode values
- **Colors**: `useColors()` hook for theme-aware color resolution
- **TypeScript**: strict mode, path alias `@/*` → repo root

## Key Components
`MiniPlayer` (persistent audio bar) · `ProfileContent` (full profile UI, ~45KB) · `SoundGraphics` / `StoryGraphics` (SVG art) · `SleepRatingWidget` · `EvolutionToast` · `ScreenLoader` · `SyncObserver` · `HeartAnimation` · `BottomNav`

## Key Dependencies
`expo ~54` · `expo-router ~6` · `react 19.1` · `react-native 0.81` · `expo-audio` · `expo-av` · `react-native-reanimated ~4` · `react-native-svg` · `expo-linear-gradient` · `expo-image` · `expo-notifications` · `react-native-purchases` (RevenueCat) · `@supabase/supabase-js` · `posthog-react-native`
