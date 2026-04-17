import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { posthog } from '@/config/posthog';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'appl_waXPQUDiYzWHVWHJqvugZjgpqnP',
  android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '',
  default: ''
});

const ENTITLEMENT_ID = 'Rizzze Pro';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  presentPaywall: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // BYPASS FOR SCREENSHOTS: Set this to false for production
  const BYPASS_FOR_SCREENSHOTS = false; 
  const isPro = BYPASS_FOR_SCREENSHOTS || !!customerInfo?.entitlements.active[ENTITLEMENT_ID];

  useEffect(() => {
    if (isExpoGo) {
      console.warn('[SubscriptionContext] Running in Expo Go. RevenueCat is disabled to prevent crash. Use a development build to test subscriptions.');
      setIsLoading(false);
      return;
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);
    }

    try {
      Purchases.configure({ apiKey: API_KEY! });

      Purchases.getCustomerInfo()
        .then((info) => {
          setCustomerInfo(info);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));

      Purchases.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
      });
    } catch (error) {
      console.error('[SubscriptionContext] Failed to configure Purchases:', error);
      setIsLoading(false);
    }

    return () => {};
  }, []);


  const presentPaywall = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywall();
      const success = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
      if (success) {
        posthog.capture('subscription_started', {
          result: result === PAYWALL_RESULT.PURCHASED ? 'purchased' : 'restored',
        });
      }
      return success;
    } catch {
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    if (isExpoGo) {
      console.warn('[SubscriptionContext] restorePurchases called in Expo Go. Skipping.');
      return;
    }
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
    } catch {}
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ isPro, isLoading, customerInfo, presentPaywall, restorePurchases }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}
