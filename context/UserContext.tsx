import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  userId: string;
  name: string;
  email: string; // New
  isEmailVerified: boolean; // New
  goal: string;
  ageRange: string;
  gender: string;
  setName: (name: string) => Promise<void>;
  setEmail: (email: string, verified: boolean) => Promise<void>; // New
  setGoal: (goal: string) => Promise<void>;
  setAgeRange: (ageRange: string) => Promise<void>;
  setGender: (gender: string) => Promise<void>;
  resetUserData: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_ID_STORAGE_KEY = 'rizzze_user_id';
const NAME_STORAGE_KEY = 'rizzze_user_name';
const EMAIL_STORAGE_KEY = 'rizzze_user_email';
const EMAIL_VERIFIED_KEY = 'rizzze_email_verified';
const GOAL_STORAGE_KEY = 'rizzze_user_goal';
const AGE_STORAGE_KEY = 'rizzze_user_age';
const GENDER_STORAGE_KEY = 'rizzze_user_gender';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string>('');
  const [name, setNameState] = useState<string>('Guest');
  const [email, setEmailState] = useState<string>('');
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [goal, setGoalState] = useState<string>('');
  const [ageRange, setAgeRangeState] = useState<string>('');
  const [gender, setGenderState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedUserId, savedName, savedEmail, savedVerified, savedGoal, savedAge, savedGender] = await Promise.all([
          AsyncStorage.getItem(USER_ID_STORAGE_KEY),
          AsyncStorage.getItem(NAME_STORAGE_KEY),
          AsyncStorage.getItem(EMAIL_STORAGE_KEY),
          AsyncStorage.getItem(EMAIL_VERIFIED_KEY),
          AsyncStorage.getItem(GOAL_STORAGE_KEY),
          AsyncStorage.getItem(AGE_STORAGE_KEY),
          AsyncStorage.getItem(GENDER_STORAGE_KEY),
        ]);

        if (savedUserId) {
          setUserIdState(savedUserId);
        } else {
          // Generate new anonymous ID
          const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          setUserIdState(newId);
          await AsyncStorage.setItem(USER_ID_STORAGE_KEY, newId);
        }

        if (savedName) setNameState(savedName);
        if (savedEmail) setEmailState(savedEmail);
        if (savedVerified) setIsEmailVerified(JSON.parse(savedVerified));
        if (savedGoal) setGoalState(savedGoal);
        if (savedAge) setAgeRangeState(savedAge);
        if (savedGender) setGenderState(savedGender);
      } catch (e) {
        console.error('Failed to load user data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const setName = async (newName: string) => {
    setNameState(newName);
    try {
      await AsyncStorage.setItem(NAME_STORAGE_KEY, newName);
    } catch (e) {
      console.error('Failed to save user name', e);
    }
  };

  const setEmail = async (newEmail: string, verified: boolean) => {
    setEmailState(newEmail);
    setIsEmailVerified(verified);
    try {
      await AsyncStorage.setItem(EMAIL_STORAGE_KEY, newEmail);
      await AsyncStorage.setItem(EMAIL_VERIFIED_KEY, JSON.stringify(verified));
    } catch (e) {
      console.error('Failed to save email', e);
    }
  };

  const setGoal = async (newGoal: string) => {
    setGoalState(newGoal);
    try {
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, newGoal);
    } catch (e) {
      console.error('Failed to save goal', e);
    }
  };

  const setAgeRange = async (newAgeRange: string) => {
    setAgeRangeState(newAgeRange);
    try {
      await AsyncStorage.setItem(AGE_STORAGE_KEY, newAgeRange);
    } catch (e) {
      console.error('Failed to save age range', e);
    }
  };

  const setGender = async (newGender: string) => {
    setGenderState(newGender);
    try {
      await AsyncStorage.setItem(GENDER_STORAGE_KEY, newGender);
    } catch (e) {
      console.error('Failed to save gender', e);
    }
  };

  const resetUserData = async () => {
    setNameState('Guest');
    setEmailState('');
    setIsEmailVerified(false);
    setGoalState('');
    setAgeRangeState('');
    setGenderState('');
    try {
      await AsyncStorage.multiRemove([
        NAME_STORAGE_KEY, 
        EMAIL_STORAGE_KEY,
        EMAIL_VERIFIED_KEY,
        GOAL_STORAGE_KEY, 
        AGE_STORAGE_KEY, 
        GENDER_STORAGE_KEY
      ]);
    } catch (e) {
      console.error('Failed to clear user data', e);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userId,
      name, setName, 
      email, isEmailVerified, setEmail,
      goal, setGoal,
      ageRange, setAgeRange,
      gender, setGender,
      resetUserData, isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
