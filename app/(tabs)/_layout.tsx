import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { MiniPlayer } from '@/components/MiniPlayer';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="sleep" options={{ title: 'Sleep' }} />
        <Tabs.Screen name="sounds" options={{ title: 'Sounds' }} />
        <Tabs.Screen name="stories" options={{ title: 'Stories' }} />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
