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
```

There is no test suite configured.

## Architecture Overview

**Rizzze** is a React Native sleep/relaxation app built with Expo. It targets iOS, Android, and Web from a single codebase.

### Routing (expo-router, file-based)

```
app/index.tsx            → Onboarding (4-screen welcome flow)
app/(tabs)/index.tsx     → Home hub (featured scenes + quick play)
app/(tabs)/sounds.tsx    → Full sound library browser
app/(tabs)/sleep.tsx     → Sleep quality tracking
app/player.tsx           → Full-screen player modal (pushed as fullScreenModal)
```

Navigation: Onboarding → Tab navigator. The full-screen player is opened via `router.push('/player?title=...&file=...&graphicId=...')`.

### Audio System (`context/AudioContext.tsx`)

The most complex part of the app. Key points:
- **Dual-player ping-pong looping**: Two `expo-audio` players cross-fade at loop boundaries for seamless looping. When player A nears its end (within 1.2s), player B loads and starts; they alternate on each loop.
- **Virtual progress timer**: A `setInterval` at 50ms updates visual progress independently from native audio position queries. This is intentional — polling native position caused jank.
- **Sound durations**: "simple_*" sounds are 60s; all others are 300s. These are hardcoded in `SOUND_DURATIONS`.
- All audio state (current sound, playing/paused, loop enabled, progress) is managed here and consumed via `useAudio()`.

### Key Components

- **`components/MiniPlayer.tsx`**: Persistent bottom bar visible across all tabs. Tapping it pushes `/player`.
- **`components/SoundGraphics.tsx`**: Each sound has a unique SVG scene graphic. `graphicId` strings map to specific SVG components.
- **`constants/theme.ts`**: All design tokens (colors, spacing, radii, shadows, typography). Use these — don't hardcode values.

### Design System

Fonts are Nunito (loaded via `@expo-google-fonts/nunito`). Colors are soft pastels: cream backgrounds, lavender/purple accents. All token names are in `constants/theme.ts`.

Use `components/themed-text.tsx` and `components/themed-view.tsx` for dark/light mode aware UI. `hooks/use-theme-color.ts` provides per-token color resolution.

### TypeScript

Strict mode enabled. Path alias `@/*` maps to the repo root (e.g. `@/components/MiniPlayer`).
