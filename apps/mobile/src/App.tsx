/**
 * Main mobile app component
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { THEME } from '@repo/config';
import CommandsScreen from './screens/CommandsScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK_BG,
  },
});

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: THEME.PRIMARY_GREEN,
          background: THEME.DARK_BG,
          card: THEME.DARK_BG,
          text: THEME.TEXT_COLOR,
          border: THEME.BORDER_COLOR,
          notification: THEME.ERROR_RED,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: THEME.PRIMARY_GREEN,
          tabBarInactiveTintColor: THEME.MUTED_TEXT,
          tabBarStyle: {
            backgroundColor: THEME.DARK_BG,
            borderTopColor: THEME.BORDER_COLOR,
            borderTopWidth: 2,
          },
          headerStyle: {
            backgroundColor: THEME.DARK_BG,
            borderBottomColor: THEME.BORDER_COLOR,
            borderBottomWidth: 2,
          },
          headerTintColor: THEME.PRIMARY_GREEN,
          headerTitleStyle: {
            color: THEME.PRIMARY_GREEN,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Commands"
          component={CommandsScreen}
          options={{
            title: '📋 COMMANDS',
            tabBarLabel: 'Commands',
            tabBarIcon: ({ color }) => <CommandIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: '⏱️ HISTORY',
            tabBarLabel: 'History',
            tabBarIcon: ({ color }) => <HistoryIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '⚙️ SETTINGS',
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function CommandIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 2 }} />;
}

function HistoryIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 2 }} />;
}

function SettingsIcon({ color }: { color: string }) {
  return <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 2 }} />;
}
