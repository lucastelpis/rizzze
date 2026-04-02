// Only initialize notifications on native platforms
const isNative = Platform.OS !== 'web';

const Notifications = isNative ? require('expo-notifications') : null;
const Device = isNative ? require('expo-device') : null;

// Configure how notifications are handled when the app is in the foreground (Native Only)
if (Notifications && Notifications.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
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
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleDailyCheckIn: (enabled: boolean) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  resetConfig: () => Promise<void>;
}

const STORAGE_KEYS = {
  ENABLED: 'rizzze_notifications_enabled',
  CHECKIN_ENABLED: 'rizzze_checkin_enabled',
  BEDTIME: 'rizzze_bedtime_config',
  WAKEUP: 'rizzze_wakeup_config',
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

  const scheduleBedtimeReminder = useCallback(async (hour: number, minute: number) => {
    if (!isNative || !Notifications) return;
    
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!isNotificationsEnabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to get ready for sleep 🌙",
        body: "Your bedtime is approaching. Would you like to listen to a story?",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  }, [isNotificationsEnabled]);

  const setBedtime = async (hour: number, minute: number) => {
    const newBedtime = { hour, minute };
    setBedtimeState(newBedtime);
    await AsyncStorage.setItem(STORAGE_KEYS.BEDTIME, JSON.stringify(newBedtime));
    
    if (isNotificationsEnabled) {
      await scheduleBedtimeReminder(hour, minute);
    }
  };

  const setWakeUpTime = async (hour: number, minute: number) => {
    const newWakeUp = { hour, minute };
    setWakeUpTimeState(newWakeUp);
    await AsyncStorage.setItem(STORAGE_KEYS.WAKEUP, JSON.stringify(newWakeUp));
  };

  const toggleDailyCheckIn = async (enabled: boolean) => {
    setIsDailyCheckInEnabled(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKIN_ENABLED, JSON.stringify(enabled));
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (!granted) return;
      
      setIsNotificationsEnabled(true);
      await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(true));
      await scheduleBedtimeReminder(bedtime.hour, bedtime.minute);
    } else {
      setIsNotificationsEnabled(false);
      await AsyncStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(false));
      if (isNative && Notifications) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    }
  };

  const sendTestNotification = async () => {
    if (!isNative || !Notifications) return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rizzze Test Notification 🐑",
        body: "Look at that! Local notifications are working perfectly.",
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
