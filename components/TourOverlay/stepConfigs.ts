import { TourStepConfig } from './types';

export const STEP_CONFIGS: TourStepConfig[] = [
  {
    index: 0,
    label: 'DAILY CHECK-IN',
    title: 'Start your day here',
    body: 'Rate last night\'s sleep. Each check-in helps your sheep grow. You can also write a note in your sleep diary!',
    tooltipPlacement: 'below',
    borderRadius: 28, // matches SleepRatingWidget successWrapper borderRadius
  },
  {
    index: 1,
    label: 'YOUR SHEEP',
    title: 'Watch it grow',
    body: 'Go to your profile to check the growth of your sheep and access the app\'s general settings.',
    tooltipPlacement: 'below',
    borderRadius: 22, // matches sheepButton circular shape (44x44, borderRadius: 22)
  },
  {
    index: 2,
    label: 'STREAK',
    title: 'Keep the streak going',
    body: 'Missed a day? No problem. Your sheep waits patiently — there\'s no punishment for breaks.',
    tooltipPlacement: 'below',
    borderRadius: 12, // soft rounding for the flat streak section
  },
  {
    index: 3,
    label: 'EXPLORE',
    title: 'Wind down your way',
    body: 'Dive into calming sounds, bedtime stories, and games designed to help you unwind.',
    tooltipPlacement: 'above',
    borderRadius: 16, // wraps the 2x2 category grid container
  },
  {
    index: 4,
    label: 'NAVIGATION',
    title: 'Move around the app easily',
    body: 'Access Home, Sleep, Sounds, and Stories instantly from this bottom bar.',
    tooltipPlacement: 'above',
    isLast: true,
    borderRadius: 0, // flat bottom nav bar
  },
];
