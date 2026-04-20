import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Image } from 'react-native';
import { useStreak } from './StreakContext';
import { NARRATION_ASSETS } from '@/constants/narrationAssets';

setAudioModeAsync({
  playsInSilentMode: true,
  interruptionMode: 'doNotMix', // Priority mode
  allowsRecording: false,
  shouldPlayInBackground: true,
  staysActiveInBackground: true,
  shouldRouteThroughEarpiece: false,
}).catch(console.error);

export const SOUND_ASSETS: Record<string, any> = {
  'forest.m4a': require('@/assets/audio/sounds/forest.m4a'),
  'beach.m4a': require('@/assets/audio/sounds/beach.m4a'),
  'rainydrive.m4a': require('@/assets/audio/sounds/rainydrive.m4a'),
  'fireplace.m4a': require('@/assets/audio/sounds/fireplace.m4a'),
  'coffeeshop.m4a': require('@/assets/audio/sounds/coffeeshop.m4a'),
  'birds.m4a': require('@/assets/audio/sounds/birds.m4a'),
  'simple_rain.m4a': require('@/assets/audio/sounds/simple_rain.m4a'),
  'simple_fan.m4a': require('@/assets/audio/sounds/simple_fan.m4a'),
  'simple_static.m4a': require('@/assets/audio/sounds/simple_static.m4a'),
  'simple_ac.m4a': require('@/assets/audio/sounds/simple_ac.m4a'),
  ...NARRATION_ASSETS,
};

export type SoundMeta = {
  title: string;
  subtitle: string;
  soundFile: string;
  graphicId?: string;
};

type AudioPlaybackContextType = {
  playSelectedSound: (sound: SoundMeta) => void;
  togglePlayPause: () => void;
  stopSound: () => void;
  scrubTo: (position: number) => void;
  setIsScrubbing: (scrubbing: boolean) => void;
  toggleLoop: () => void;
  setSleepTimer: (minutes: number | null) => void;
  setVolume: (val: number) => void;
};

type AudioStatusContextType = {
  activeSound: SoundMeta | null;
  isPlaying: boolean;
  isLooping: boolean;
  visualProgress: number;
  visualDuration: number;
  displayPosition: number;
  sleepTimerRemaining: number | null;
  volume: number;
};

const AudioPlaybackContext = createContext<AudioPlaybackContextType | null>(null);
const AudioStatusContext = createContext<AudioStatusContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeSound, setActiveSound] = useState<SoundMeta | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [volume, setVolumeState] = useState(0.5);
  const { markActivity } = useStreak();
  
  const lastTimeRef = useRef(Date.now());
  const scrubPositionRef = useRef(0);
  const wasPlayingRef = useRef(false);

  // When activeSound changes, we need to update the asset.
  const asset = activeSound ? SOUND_ASSETS[activeSound.soundFile] : null;

  // Dual Player Setup - Increased update interval to 100ms for performance
  const player1 = useAudioPlayer(asset, { updateInterval: 100 });
  const player2 = useAudioPlayer(asset, { updateInterval: 100 });
  const status1 = useAudioPlayerStatus(player1);
  const status2 = useAudioPlayerStatus(player2);

  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const activeStatus = activePlayerIdx === 0 ? status1 : status2;

  // Reset logic when a new sound is selected
  useEffect(() => {
    if (!activeSound) return;

    const metadata = {
      title: activeSound.title,
      artist: activeSound.subtitle || 'Rizzze',
      albumTitle: 'Deep Sleep',
      artworkUrl: Image.resolveAssetSource(require('@/assets/images/icon.png')).uri,
    };
    
    // Clear any previous controls first to avoid conflict
    player1.clearLockScreenControls();
    player2.clearLockScreenControls();
    
    player1.setActiveForLockScreen(true, metadata);
    
    player1.loop = false;
    player2.loop = false;
    player1.seekTo(0);
    player2.seekTo(0);
    setActivePlayerIdx(0);
    setVisualProgress(0);
    player1.play();
  }, [activeSound, player1, player2]);

  // Handle Volume Changes
  useEffect(() => {
    player1.volume = volume;
    player2.volume = volume;
  }, [volume, player1, player2]);

  // Ping-Pong Looping logic
  useEffect(() => {
    if (!activeSound || !activeStatus.duration) return;

    const isAnyPlaying = status1.playing || status2.playing;

    if (isLooping && isAnyPlaying) {
      const remainingTime = activeStatus.duration - activeStatus.currentTime;
      const OVERLAP = 1.2; 

      if (remainingTime <= OVERLAP && remainingTime > 0) {
        const nextIdx = activePlayerIdx === 0 ? 1 : 0;
        const nextPlayer = nextIdx === 0 ? player1 : player2;
        const nextStatus = nextIdx === 0 ? status1 : status2;
        
        if (!nextStatus.playing) {
          nextPlayer.play();
        }
      }
    }

    if (activeStatus.currentTime >= activeStatus.duration - 0.05 && activeStatus.duration > 0) {
      if (isLooping) {
        const nextIdx = activePlayerIdx === 0 ? 1 : 0;
        const finishedPlayer = activePlayerIdx === 0 ? player1 : player2;
        
        setTimeout(() => {
          finishedPlayer.seekTo(0);
        }, 300);

        // Transition the lock screen control to the new active player
        const metadata = {
          title: activeSound.title,
          artist: activeSound.subtitle || 'Rizzze',
          albumTitle: 'Deep Sleep',
          artworkUrl: Image.resolveAssetSource(require('@/assets/images/icon.png')).uri,
        };
        const nextPlayer = nextIdx === 0 ? player1 : player2;
        const oldPlayer = nextIdx === 0 ? player2 : player1;
        
        oldPlayer.clearLockScreenControls();
        nextPlayer.setActiveForLockScreen(true, metadata);

        setActivePlayerIdx(nextIdx);
      }
    }
  }, [activeStatus.currentTime, activeStatus.duration, activePlayerIdx, isLooping, status1.playing, status2.playing, player1, player2, activeSound]);

  const isPlaying = status1.playing || status2.playing;
  const isSimpleSound = activeSound?.subtitle?.includes('Simple') ?? false;
  const visualDuration = isSimpleSound ? 60 * 1000 : 5 * 60 * 1000; 

  // Custom UI Timer - Reduced frequency to 250ms for performance
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !isScrubbing && activeSound) {
      lastTimeRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;

        setVisualProgress((prev) => {
          const next = prev + delta;
          if (next >= visualDuration) {
            if (isLooping) {
              return next % visualDuration;
            } else {
              player1.pause();
              player2.pause();
              return visualDuration;
            }
          }
          return next;
        });
      }, 250); 
    } else {
      lastTimeRef.current = Date.now(); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, isScrubbing, isLooping, visualDuration, activeSound]);

  // Sleep Timer Countdown Logic
  useEffect(() => {
    if (!sleepTimerEnd) {
      setSleepTimerRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((sleepTimerEnd - now) / 1000));
      setSleepTimerRemaining(remaining);

      if (remaining === 0) {
        setSleepTimerEnd(null);
        player1.pause();
        player2.pause();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd, player1, player2]);

  const displayPosition = isScrubbing ? scrubPosition : visualProgress;

  const playbackHandlers = React.useMemo(() => ({
    playSelectedSound: (sound: SoundMeta) => {
      if (activeSound?.soundFile === sound.soundFile) {
        if (!isPlaying) {
          try {
            const activePlayer = activePlayerIdx === 0 ? player1 : player2;
            activePlayer.play();
          } catch (e) {}
        }
        return;
      }
      
      try {
        player1.pause();
        player2.pause();
      } catch (err) {}
      
      setActiveSound(sound);
      setVolumeState(0.5);
      markActivity();
    },
    togglePlayPause: () => {
      if (!activeSound) return;
      try {
        if (isPlaying) {
          player1.pause();
          player2.pause();
        } else {
          const activePlayer = activePlayerIdx === 0 ? player1 : player2;
          if (visualProgress >= visualDuration && !isLooping) {
            setVisualProgress(0);
            activePlayer.seekTo(0);
          }
          activePlayer.play();
        }
      } catch (err) {
        console.warn('Audio toggle failed:', err);
      }
    },
    stopSound: () => {
      try {
        player1.pause();
        player2.pause();
      } catch (err) {}
      setActiveSound(null);
    },
    scrubTo: (newPosition: number) => {
      scrubPositionRef.current = newPosition;
      setScrubPosition(newPosition);
      setVisualProgress(newPosition);
    },
    setIsScrubbing: (scrubbing: boolean) => {
      setIsScrubbing(scrubbing);
      if (scrubbing) {
        wasPlayingRef.current = isPlaying;
        player1.pause();
        player2.pause();
      } else {
        const inactivePlayer = activePlayerIdx === 0 ? player2 : player1;
        inactivePlayer.pause();
        inactivePlayer.seekTo(0);

        const activePlayer = activePlayerIdx === 0 ? player1 : player2;
        if (activeStatus.duration) {
          const nativeSeek = (scrubPositionRef.current / 1000) % activeStatus.duration;
          activePlayer.seekTo(nativeSeek);
        }
        
        if (wasPlayingRef.current) {
          activePlayer.play();
        }
      }
    },
    toggleLoop: () => setIsLooping(l => !l),
    setSleepTimer: (minutes: number | null) => {
      if (minutes === null) {
        setSleepTimerEnd(null);
      } else {
        setSleepTimerEnd(Date.now() + minutes * 60 * 1000);
      }
    },
    setVolume: (val: number) => setVolumeState(val),
  }), [activeSound, isPlaying, player1, player2, activePlayerIdx, visualProgress, visualDuration, isLooping, activeStatus.duration]);

  const statusValue = React.useMemo(() => ({
    activeSound,
    isPlaying,
    isLooping,
    visualProgress,
    visualDuration,
    displayPosition,
    sleepTimerRemaining,
    volume,
  }), [activeSound, isPlaying, isLooping, visualProgress, visualDuration, displayPosition, sleepTimerRemaining, volume]);

  return (
    <AudioPlaybackContext.Provider value={playbackHandlers}>
      <AudioStatusContext.Provider value={statusValue}>
        {children}
      </AudioStatusContext.Provider>
    </AudioPlaybackContext.Provider>
  );
}

export const useAudioPlayback = () => {
  const ctx = useContext(AudioPlaybackContext);
  if (!ctx) throw new Error('useAudioPlayback must be used within AudioProvider');
  return ctx;
};

export const useAudioStatus = () => {
  const ctx = useContext(AudioStatusContext);
  if (!ctx) throw new Error('useAudioStatus must be used within AudioProvider');
  return ctx;
};

// Legacy compatibility shim to avoid breaking other files immediately
export const useAudio = () => {
  const p = useAudioPlayback();
  const s = useAudioStatus();
  return { ...p, ...s };
};
