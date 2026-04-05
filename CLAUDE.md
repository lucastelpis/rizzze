# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Platform-specific
npx expo start --ios
npx expo start --android
npx expo start --web

# Lint
npx expo lint

# Reset project to template defaults
node ./scripts/reset-project.js

# Generate narration asset mappings
node ./scripts/generate-narrations.mjs
```

There is no test suite configured. Verify changes by running the dev server and testing on device/simulator.

## Architecture Overview

**Rizzze** is a React Native sleep/relaxation app built with Expo. It targets iOS, Android, and Web from a single codebase.

### Routing (expo-router, file-based)

```
app/index.tsx                    → Onboarding (4-screen welcome flow)
app/(tabs)/_layout.tsx           → Tab navigation wrapper; hosts MiniPlayer
app/(tabs)/index.tsx             → Home hub (featured scenes + quick play)
app/(tabs)/sounds.tsx            → Full sound library browser
app/(tabs)/sleep.tsx             → Sleep quality tracking dashboard
app/(tabs)/stories.tsx           → Stories listing by category
app/(tabs)/games.tsx             → Games hub
app/player.tsx                   → Full-screen player modal (fullScreenModal)
app/profile.tsx                  → User profile page
app/games/cozy-farm.tsx          → Interactive farm game (~47KB)
app/games/sheep-jumper.tsx       → Sheep jumping game (~22KB)
app/reader/[storyId].tsx         → Story detail reader with narration
app/story-list/[categoryId].tsx  → Stories filtered by category
```

Navigation: Onboarding → Tab navigator. Full-screen player is opened via `router.push('/player?title=...&file=...&graphicId=...')`.

### State Management (6 Context Providers)

All contexts live in `context/` and persist data via `AsyncStorage`. Providers are registered in `app/_layout.tsx`.

| Context | Key Responsibility |
|---|---|
| `AudioContext.tsx` | Dual-player audio looping, playback control, virtual progress |
| `SheepGrowthContext.tsx` | Mascot growth stages, point accumulation, cooldowns |
| `SleepContext.tsx` | Daily sleep quality ratings |
| `StreakContext.tsx` | Activity streaks, last-7-days tracking |
| `ThemeContext.tsx` | Dark/light mode preference |
| `NotificationContext.tsx` | Push notifications, bedtime/wake-up scheduling |

### Audio System (`context/AudioContext.tsx`)

The most complex part of the app. Key points:
- **Dual-player ping-pong looping**: Two `expo-audio` players cross-fade at loop boundaries for seamless looping. When player A nears its end (within 1.2s), player B loads and starts; they alternate on each loop.
- **Virtual progress timer**: A `setInterval` at 50ms updates visual progress independently from native audio position queries. This is intentional — polling native position caused jank.
- **Sound durations**: `simple_*` sounds are 60s; all others are 300s. Hardcoded in `SOUND_DURATIONS`.
- All audio state (current sound, playing/paused, loop enabled, progress) is managed here and consumed via `useAudio()`.

### Sounds (`constants/sounds.ts`)

6 ambient scenes: Forest, Ocean, Rain, Fireplace, Birdsong, Café. Each has a color/gradient used for theming the player UI.

### Stories System

- 40 narrated stories across 4 mood categories: Cozy, Folklore, Reflective, Wonder.
- Story metadata is in `constants/stories.ts`.
- Narration audio files (MP3) are mapped by story ID in `constants/narrationAssets.ts`.
- Audio files live in `assets/audio/narration/<category>/`.
- Story content reference: `assets/others/rizzze-40-complete-unique-stories.md`.

### Sheep Growth System (`context/SheepGrowthContext.tsx`)

Central engagement mechanic. Key points:
- 6 growth stages defined in `constants/sheepGrowth.ts`: Tiny Lamb (0) → Golden Sheep (130 pts).
- Points are earned from: daily sleep ratings, streaks, petting, feeding.
- Pet and feed actions have 12-hour cooldowns.
- Stage transitions trigger an `EvolutionToast` notification (`components/EvolutionToast.tsx`).
- Sheep visuals: `components/SheepMascot.tsx` + stage components in `components/sheepStages/`.

### Sleep & Streak System

- `SleepContext`: stores daily quality ratings (bad → perfect scale).
- `StreakContext`: tracks active dates and last-7-days display. Sleep ratings feed into streak count.
- Utility: `utils/sleepDuration.ts` for duration math, `utils/dailyPicks.ts` for "pick of the day" logic.

### Notifications (`context/NotificationContext.tsx`)

- Schedules bedtime and wake-up push notifications.
- Handles daily check-in prompts.
- Manages device notification permissions via `expo-notifications` + `expo-device`.

### Key Components

- **`components/MiniPlayer.tsx`**: Persistent bottom bar visible across all tabs. Tapping it pushes `/player`.
- **`components/SoundGraphics.tsx`**: Each sound has a unique SVG scene graphic. `graphicId` strings map to specific SVG components.
- **`components/StoryGraphics.tsx`**: SVG graphics for story categories.
- **`components/SleepRatingWidget.tsx`**: Daily sleep quality rating UI.
- **`components/EvolutionToast.tsx`**: Toast shown on sheep stage evolution.
- **`components/ScreenLoader.tsx`**: Premium loading indicator to eliminate flicker.
- **`constants/theme.ts`**: All design tokens (colors, spacing, radii, shadows, typography). Use these — don't hardcode values.

### Design System

Fonts are Nunito (weights: 400, 500, 700, 800, 900) loaded via `@expo-google-fonts/nunito`. Colors are soft pastels: cream backgrounds, lavender/purple accents (`#8B6DAE`). All token names are in `constants/theme.ts`.

Use `components/themed-text.tsx` and `components/themed-view.tsx` for dark/light mode aware UI. `hooks/use-theme-color.ts` provides per-token color resolution. `hooks/useColors.ts` is a convenience wrapper.

### TypeScript

Strict mode enabled. Path alias `@/*` maps to the repo root (e.g. `@/components/MiniPlayer`).

### Key Dependencies

- `expo ~54` / `expo-router ~6` / `react 19` / `react-native 0.81`
- Audio: `expo-audio`, `expo-av`, `expo-speech`
- Storage: `@react-native-async-storage/async-storage`
- UI: `expo-linear-gradient`, `react-native-reanimated`, `react-native-svg`
- Notifications: `expo-notifications`, `expo-device`, `expo-haptics`
