import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { posthog } from '@/config/posthog';

const API_KEY = 'test_BkMJqBhiYVnpaevoizinqxOcXzI';

const ENTITLEMENT_ID = 'Rizzze Pro';

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

  const isPro = !!customerInfo?.entitlements.active[ENTITLEMENT_ID];

  useEffect(() => {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);
    }

    Purchases.configure({ apiKey: API_KEY! });

    Purchases.getCustomerInfo()
      .then((info) => {
        setCustomerInfo(info);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Debug: Check if offerings are actually available
    Purchases.getOfferings()
      .then((offerings) => {
        console.log("Subscription Debug - Offerings Found:", Object.keys(offerings.all));
        if (offerings.current) {
          console.log("Subscription Debug - Current Offering Packages:", offerings.current.availablePackages.map(p => p.identifier));
        } else {
          console.warn("Subscription Debug - No 'current' offering set in RevenueCat dashboard!");
        }
      })
      .catch((err) => {
        console.error("Subscription Debug - Offerings Error:", err);
      });

    Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    // In current react-native-purchases, listener return type might be void 
    // and cleanup happens automatically or via other methods. 
    // We'll remove the .remove() call to fix the lint error.
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
