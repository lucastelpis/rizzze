import { useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { supabase } from '@/utils/supabase';
import { useUser } from '@/context/UserContext';
import { useSheepGrowth } from '@/context/SheepGrowthContext';
import { useStreak } from '@/context/StreakContext';
import { useSleep } from '@/context/SleepContext';
import { useNotifications } from '@/context/NotificationContext';
import { posthog } from '@/config/posthog';

export function useBackup() {
  const { userId, email, isEmailVerified, setEmail } = useUser();

  const performBackup = useCallback(async (isSilent = false) => {
    try {
      // 1. Get the official Supabase Auth user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // 2. Only backup if we have a real authenticated user
      if (!user || userError) {
        if (!isSilent) {
          console.log('No authenticated user found, skipping cloud backup.');
        }
        return;
      }

      const keys = [
        'rizzze_user_name',
        'rizzze_user_goal',
        'rizzze_user_age',
        'rizzze_user_gender',
        'rizzze_sheep_growth',
        'rizzze_streak_data',
        'rizzze_rated_on_time_days',
        'rizzze_sleep_data',
        'rizzze_notifications_enabled',
        'rizzze_checkin_enabled',
        'rizzze_bedtime_config',
        'rizzze_wakeup_config'
      ];

      const storageData = await AsyncStorage.multiGet(keys);
      const dataPayload: Record<string, any> = {};
      
      storageData.forEach(([key, value]) => {
        if (value !== null) {
          try {
            dataPayload[key] = JSON.parse(value);
          } catch {
            dataPayload[key] = value;
          }
        }
      });

      // 3. Push to Supabase using the authenticated user.id
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: user.id, 
          email: user.email,
          data: dataPayload,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }); // Explicitly use user_id as the primary key for upsert

      if (error) throw error;

      if (!isSilent) {
        Alert.alert("Backup Successful", "Your progress is now safe in the cloud.");
      }
      posthog.capture('data_backed_up', { is_silent: isSilent, has_email: !!user.email });
    } catch (err) {
      console.error('Backup failed:', err);
      if (!isSilent) {
        Alert.alert("Backup Failed", "Please check your internet connection and try again.");
      }
    }
  }, []);

  const sendVerificationCode = async (targetEmail: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: targetEmail });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to send OTP:', err);
      Alert.alert("Error", "Failed to send verification code. Please try again.");
      return false;
    }
  };

  const migrateAnonymousData = async (newUserId: string, oldGuestId: string) => {
    try {
      console.log(`Migrating data from guest ${oldGuestId} to user ${newUserId}...`);
      
      // 1. Move Feedbacks
      await supabase
        .from('feedbacks')
        .update({ user_id: newUserId })
        .eq('user_id', oldGuestId);

      // 2. Move Support Tickets
      await supabase
        .from('support_tickets')
        .update({ user_id: newUserId })
        .eq('user_id', oldGuestId);

      // 3. Move Votes
      await supabase
        .from('votes')
        .update({ user_id: newUserId })
        .eq('user_id', oldGuestId);

      console.log('Migration complete.');
    } catch (err) {
      console.error('Migration failed:', err);
      // We don't Alert here to avoid interrupting the main flow
    }
  };

  const verifyAndLink = async (targetEmail: string, token: string) => {
    try {
      const { data: authData, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token,
        type: 'email',
      });

      if (error || !authData.user) throw error;

      // Migration: Claim all old Guest data for the new account
      if (userId && userId !== authData.user.id) {
        await migrateAnonymousData(authData.user.id, userId);
      }

      // Update local state
      await setEmail(targetEmail, true);
      
      // Perform an initial backup now that it's linked
      await performBackup(true);
      
      Alert.alert("Success!", "Your email is now linked and cloud sync is active. Your previous feedbacks and tickets have been moved to your account.");
      posthog.capture('email_linked', { email: targetEmail });
      return true;
    } catch (err) {
      console.error('Verification failed:', err);
      Alert.alert("Invalid Code", "The code you entered is incorrect or has expired.");
      return false;
    }
  };

  const unlinkEmail = async () => {
    try {
      await supabase.auth.signOut();
      await setEmail('', false);
      Alert.alert("Unlinked", "Cloud Sync has been disabled.");
      posthog.capture('email_unlinked');
      return true;
    } catch (err) {
      console.error('Failed to unlink email:', err);
      Alert.alert("Error", "Could not remove Cloud Sync. Try again.");
      return false;
    }
  };

  const handleApplyData = async (dataBlob: any) => {
    try {
      const entries = Object.entries(dataBlob);
      const keyValuePairs: [string, string][] = entries.map(([key, value]) => [
        key, 
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);

      await AsyncStorage.multiSet(keyValuePairs);
      
      if (!__DEV__) {
        await Updates.reloadAsync();
      } else {
        Alert.alert("Success", "Data restored. Please manually restart the app to see changes (Developer Mode).");
      }
    } catch (e) {
      console.error('Failed to apply data:', e);
      Alert.alert("Error", "Failed to apply restored data.");
    }
  };

  const restoreFromEmail = async (targetEmail: string, token: string) => {
    try {
      // 1. Verify OTP first
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token,
        type: 'email',
      });

      if (authError || !authData) throw authError;

      // 2. Fetch data associated with this user ID (now that we are logged in)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('data')
        .eq('user_id', authData.user?.id)
        .single();

      if (error || !data) {
        Alert.alert("No Backup Found", "We verified your email, but couldn't find a backup linked to it.");
        return false;
      }

      // 3. Confirm and Apply
      Alert.alert(
        "Confirm Restore",
        "This will overwrite your current progress. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Restore & Restart", 
            onPress: () => handleApplyData(data.data) 
          }
        ]
      );
      return true;
    } catch (err) {
      console.error('Restore from email failed:', err);
      Alert.alert("Error", "Invalid code or failed to fetch backup.");
      return false;
    }
  };

  return {
    performBackup,
    sendVerificationCode,
    verifyAndLink,
    restoreFromEmail,
    unlinkEmail,
    isEmailVerified,
    email
  };
}
