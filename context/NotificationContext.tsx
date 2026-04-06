// Only initialize notifications on native platforms
const isNative = Platform.OS !== 'web';

const Notifications = isNative ? require('expo-notifications') : null;
const Device = isNative ? require('expo-device') : null;

// Configure how notifications are handled when the app is in the foreground (Native Only)
if (Notifications && Notifications.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BEDTIME_MESSAGES, CHECKIN_MESSAGES } from '@/constants/notifications';

interface BedtimeConfig {
  hour: number;
  minute: number;
}

interface NotificationContextType {
  isNotificationsEnabled: boolean;
  isDailyCheckInEnabled: boolean;
  bedtime: BedtimeConfig;
  wakeUpTime: BedtimeConfig;
  permissionStatus: string | null;
  requestPermission: () => Promise<boolean>;
  setBedtime: (hour: number, minute: number) => Promise<void>;
  setWakeUpTime: (hour: number, minute: number) => Promise<void>;
  toggleNotifications: (enabled: boolean, shouldRequestPermission?: boolean) => Promise<void>;
  toggleDailyCheckIn: (enabled: boolean, shouldRequestPermission?: boolean) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  resetConfig: () => Promise<void>;
}

const STORAGE_KEYS = {
  ENABLED: 'rizzze_notifications_enabled',
  CHECKIN_ENABLED: 'rizzze_checkin_enabled',
  BEDTIME: 'rizzze_bedtime_config',
  WAKEUP: 'rizzze_wakeup_config',
};

const getRandomMessage = (messages: string[]) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDailyCheckInEnabled, setIsDailyCheckInEnabled] = useState(true);
  const [bedtime, setBedtimeState] = useState<BedtimeConfig>({ hour: 22, minute: 30 }); // Default 10:30 PM
  const [wakeUpTime, setWakeUpTimeState] = useState<BedtimeConfig>({ hour: 7, minute: 0 }); // Default 7:00 AM
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  // Load settings and check permissions on mount
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Check current permission status (Native Only)
        if (isNative && Notifications) {
          const { status } = await Notifications.getPermissionsAsync();
          setPermissionStatus(status);
        }

        // 2. Load stored preferences
        const storedEnabled = await AsyncStorage.getItem(STORAGE_KEYS.ENABLED);
        const storedCheckinEnabled = await AsyncStorage.getItem(STORAGE_KEYS.CHECKIN_ENABLED);
        const storedBedtime = await AsyncStorage.getItem(STORAGE_KEYS.BEDTIME);
        const storedWakeUp = await AsyncStorage.getItem(STORAGE_KEYS.WAKEUP);

        if (storedEnabled !== null) {
          setIsNotificationsEnabled(JSON.parse(storedEnabled));
        }
        if (storedCheckinEnabled !== null) {
          setIsDailyCheckInEnabled(JSON.parse(storedCheckinEnabled));
        }
        if (storedBedtime !== null) {
          setBedtimeState(JSON.parse(storedBedtime));
        }
        if (storedWakeUp !== null) {
          setWakeUpTimeState(JSON.parse(storedWakeUp));
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    init();
  }, []);

  const requestPermission = async () => {
    if (!isNative || !Notifications || !Device) return true;

    if (!Device.isDevice) {
      if (Platform.OS === 'ios') {
        // Simple warn
      }
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive bedtime reminders.'
      );
      return false;
    }

    return true;
  };

  // Helper to re-schedule all notifications based on current state
  const refreshScheduledNotifications = useCallback(async () => {
    if (!isNative || !Notifications) return;
    
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 1. Bedtime Reminder
    if (isNotificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to get ready for sleep 🌙",
          body: getRandomMessage(BEDTIME_MESSAGES),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: bedtime.hour,
          minute: bedtime.minute,
          repeats: true,
        },
      });
    }

    // 2. Morning Check-in
    if (isDailyCheckInEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rise and shine! 🐑",
          body: getRandomMessage(CHECKIN_MESSAGES),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: wakeUpTime.hour,
          minute: wakeUpTime.minute,
          repeats: true,
        },
      });
    }
  }, [isNotificationsEnabled, isDailyCheckInEnabled, bedtime, wakeUpTime]);

  // Sync scheduled notifications whenever settings change
  useEffect(() => {
    refreshScheduledNotifications();
  }, [refreshScheduledNotifications]);

  const setBedtime = async (hour: number, minute: number) => {
    const newBedtime = { hour, minute };
    setBedtimeState(newBedtime);
    await AsyncStorage.setItem(STORAGE_KEYS.BEDTIME, JSON.stringify(newBedtime));
  };

  const setWakeUpTime = async (hour: number, minute: number) => {
    const newWakeUp = { hour, minute };
    setWakeUpTimeState(newWakeUp);
    await AsyncStorage.setItem(STORAGE_KEYS.WAKEUP, JSON.stringify(newWakeUp));
  };

  const toggleDailyCheckIn = async (enabled: boolean, shouldRequestPermission: boolean = true) => {
    if (enabled && shouldRequestPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    setIsDailyCheckInEnabled(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKIN_ENABLED, JSON.stringify(enabled));
  };

  const toggleNotifications = async (enabled: boolean, shouldRequestPermission: boolean = true) => {
    if (enabled && shouldRequestPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    setIsNotificationsEnabled(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(enabled));
  };

  const sendTestNotification = async () => {
    if (!isNative || !Notifications) return;
    
    const isBedtimeTest = Math.random() > 0.5;
    const testTitle = isBedtimeTest ? "Rizzze Bedtime Test 🌙" : "Rizzze Check-in Test 🐑";
    const testBody = isBedtimeTest ? getRandomMessage(BEDTIME_MESSAGES) : getRandomMessage(CHECKIN_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: testTitle,
        body: testBody,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  };

  const resetConfig = async () => {
    setIsNotificationsEnabled(true);
    setIsDailyCheckInEnabled(true);
    setBedtimeState({ hour: 22, minute: 30 });
    setWakeUpTimeState({ hour: 7, minute: 0 });
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ENABLED,
      STORAGE_KEYS.CHECKIN_ENABLED,
      STORAGE_KEYS.BEDTIME,
      STORAGE_KEYS.WAKEUP
    ]);
    if (isNative && Notifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };


  return (
    <NotificationContext.Provider
      value={{
        isNotificationsEnabled,
        isDailyCheckInEnabled,
        bedtime,
        wakeUpTime,
        permissionStatus,
        requestPermission,
        setBedtime,
        setWakeUpTime,
        toggleNotifications,
        toggleDailyCheckIn,
        sendTestNotification,
        resetConfig,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
