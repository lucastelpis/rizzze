import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

setAudioModeAsync({
  playsInSilentMode: true,
  interruptionMode: 'doNotMix',
  allowsRecording: false,
  shouldPlayInBackground: true,
  shouldRouteThroughEarpiece: false,
}).catch(console.error);

const SOUND_ASSETS: Record<string, any> = {
  'forest.m4a': require('@/assets/sounds/forest.m4a'),
  'beach.m4a': require('@/assets/sounds/beach.m4a'),
  'city_rain.m4a': require('@/assets/sounds/city_rain.m4a'),
  'fireplace.m4a': require('@/assets/sounds/fireplace.m4a'),
  'coffeeshop.m4a': require('@/assets/sounds/coffeeshop.m4a'),
  'birds.m4a': require('@/assets/sounds/birds.m4a'),
  'simple_rain.m4a': require('@/assets/sounds/simple_rain.m4a'),
  'simple_fan.m4a': require('@/assets/sounds/simple_fan.m4a'),
  'simple_static.m4a': require('@/assets/sounds/simple_static.m4a'),
  'simple_ac.m4a': require('@/assets/sounds/simple_ac.m4a'),
};

export type SoundMeta = {
  title: string;
  subtitle: string;
  soundFile: string;
  graphicId?: string;
};

type AudioContextType = {
  activeSound: SoundMeta | null;
  isPlaying: boolean;
  isLooping: boolean;
  toggleLoop: () => void;
  visualProgress: number;
  visualDuration: number;
  displayPosition: number;
  playSelectedSound: (sound: SoundMeta) => void;
  togglePlayPause: () => void;
  stopSound: () => void;
  scrubTo: (position: number) => void;
  setIsScrubbing: (scrubbing: boolean) => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeSound, setActiveSound] = useState<SoundMeta | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  
  const lastTimeRef = useRef(Date.now());
  const scrubPositionRef = useRef(0);
  const wasPlayingRef = useRef(false);

  // When activeSound changes, we need to update the asset.
  const asset = activeSound ? SOUND_ASSETS[activeSound.soundFile] : null;

  // Dual Player Setup
  const player1 = useAudioPlayer(asset, { updateInterval: 30 });
  const player2 = useAudioPlayer(asset, { updateInterval: 30 });
  const status1 = useAudioPlayerStatus(player1);
  const status2 = useAudioPlayerStatus(player2);

  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const activeStatus = activePlayerIdx === 0 ? status1 : status2;

  // Reset logic when a new sound is selected
  useEffect(() => {
    if (activeSound) {
      const metadata = {
        title: activeSound.title,
        artist: 'Rizzze',
        album: activeSound.subtitle || 'Scenes',
      };
      
      (player1 as any).setMetadata?.(metadata);
      (player2 as any).setMetadata?.(metadata);
      
      // For lock screen controls
      (player1 as any).setActiveForLockScreen?.(true, metadata);
      (player2 as any).setActiveForLockScreen?.(true, metadata);
      
      player1.loop = false;
      player2.loop = false;
      player1.seekTo(0);
      player2.seekTo(0);
      setActivePlayerIdx(0);
      setVisualProgress(0);
      player1.play();
    }
  }, [activeSound, player1, player2]);

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

        setActivePlayerIdx(nextIdx);
      }
    }
  }, [activeStatus.currentTime, activeStatus.duration, activePlayerIdx, isLooping, status1.playing, status2.playing, player1, player2, activeSound]);

  const isPlaying = status1.playing || status2.playing;
  const isSimpleSound = activeSound?.subtitle?.includes('Simple') ?? false;
  const visualDuration = isSimpleSound ? 60 * 1000 : 5 * 60 * 1000; 

  // Custom UI Timer
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
      }, 50);
    } else {
      lastTimeRef.current = Date.now(); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, isScrubbing, isLooping, visualDuration, activeSound]);

  const displayPosition = isScrubbing ? scrubPosition : visualProgress;

  const playSelectedSound = (sound: SoundMeta) => {
    if (activeSound?.soundFile === sound.soundFile) {
      // If it's the exact same sound, just make sure it's playing
      if (!isPlaying) togglePlayPause();
      return;
    }
    // New sound
    player1.pause();
    player2.pause();
    setActiveSound(sound);
  };

  const togglePlayPause = () => {
    if (!activeSound) return;
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
  };

  const stopSound = () => {
    player1.pause();
    player2.pause();
    setActiveSound(null);
  };

  const scrubTo = (newPosition: number) => {
    scrubPositionRef.current = newPosition;
    setScrubPosition(newPosition);
    setVisualProgress(newPosition);
  };

  const handleSetIsScrubbing = (scrubbing: boolean) => {
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
  };

  return (
    <AudioContext.Provider
      value={{
        activeSound,
        isPlaying,
        isLooping,
        toggleLoop: () => setIsLooping(l => !l),
        visualProgress,
        visualDuration,
        displayPosition,
        playSelectedSound,
        togglePlayPause,
        stopSound,
        scrubTo,
        setIsScrubbing: handleSetIsScrubbing,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
