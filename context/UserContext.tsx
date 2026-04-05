import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  name: string;
  setName: (name: string) => Promise<void>;
  resetUserData: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const NAME_STORAGE_KEY = 'rizzze_user_name';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setNameState] = useState<string>('Guest');
  const [isLoading, setIsLoading] = useState(true);

  // Load name from storage on mount
  useEffect(() => {
    const loadName = async () => {
      try {
        const savedName = await AsyncStorage.getItem(NAME_STORAGE_KEY);
        if (savedName) {
          setNameState(savedName);
        }
      } catch (e) {
        console.error('Failed to load user name', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadName();
  }, []);

  const setName = async (newName: string) => {
    setNameState(newName);
    try {
      await AsyncStorage.setItem(NAME_STORAGE_KEY, newName);
    } catch (e) {
      console.error('Failed to save user name', e);
    }
  };

  const resetUserData = async () => {
    setNameState('Guest');
  };

  return (
    <UserContext.Provider value={{ name, setName, resetUserData, isLoading }}>
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
