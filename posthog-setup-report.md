<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Rizzze Expo app. A PostHog client was configured using `expo-constants` and `app.config.js` extras, a `PostHogProvider` was added to the root layout with manual screen tracking via `usePathname`, and 13 business-critical events were instrumented across 9 files covering the full user journey — from onboarding and subscription conversion through daily sleep tracking, content engagement, and the sheep companion growth system.

| Event | Description | File |
|---|---|---|
| `onboarding_completed` | User reaches the final onboarding step and taps 'Let's Start' | `app/index.tsx` |
| `paywall_shown` | RevenueCat paywall is presented at the end of onboarding | `app/index.tsx` |
| `notifications_setup_completed` | User configures bedtime/wake-up notification preferences during onboarding | `app/index.tsx` |
| `subscription_started` | User successfully purchases or restores a subscription | `context/SubscriptionContext.tsx` |
| `restore_purchases_tapped` | User taps the restore purchases button in the profile screen | `components/ProfileContent.tsx` |
| `sound_played` | User selects and plays an ambient sound or scene | `app/(tabs)/sounds.tsx` |
| `story_opened` | User taps a story card to open the story reader | `app/(tabs)/stories.tsx` |
| `story_reading_started` | Story reader screen mounts and the user begins reading | `app/reader/[storyId].tsx` |
| `sleep_rating_submitted` | User submits a daily sleep quality rating | `components/SleepRatingWidget.tsx` |
| `sheep_petted` | User pets their sheep companion, earning growth points | `context/SheepGrowthContext.tsx` |
| `sheep_fed` | User feeds their sheep companion, earning growth points | `context/SheepGrowthContext.tsx` |
| `sheep_evolved` | Sheep companion advances to a new growth stage | `context/SheepGrowthContext.tsx` |
| `game_started` | User launches a mini-game from the games hub | `app/(tabs)/games.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/153810/dashboard/605624
- **Onboarding to Subscription Funnel**: https://eu.posthog.com/project/153810/insights/TD2bmoDK
- **Content Engagement: Sounds, Stories & Games**: https://eu.posthog.com/project/153810/insights/WEsL4jXn
- **Sleep Rating Distribution**: https://eu.posthog.com/project/153810/insights/61nlPFLM
- **Sheep Companion Engagement**: https://eu.posthog.com/project/153810/insights/HOjmuMsl
- **Sound Plays by Type (Scene vs Simple)**: https://eu.posthog.com/project/153810/insights/u7huNpxl

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>
