/**
 * Settings and configuration screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Switch,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { THEME, SPACING } from '@repo/config';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK_BG,
  },
  content: {
    padding: SPACING.MD,
  },
  section: {
    marginBottom: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: THEME.BORDER_COLOR,
    paddingTop: SPACING.MD,
  },
  sectionTitle: {
    color: THEME.PRIMARY_GREEN,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.MD,
    textTransform: 'uppercase',
  },
  field: {
    marginBottom: SPACING.MD,
  },
  label: {
    color: THEME.TEXT_COLOR,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: THEME.DARK_BG,
    borderWidth: 2,
    borderColor: THEME.BORDER_COLOR,
    color: THEME.TEXT_COLOR,
    padding: SPACING.SM,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    minHeight: 40,
  },
  button: {
    backgroundColor: THEME.PRIMARY_GREEN,
    borderRadius: 4,
    padding: SPACING.MD,
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  buttonText: {
    color: THEME.DARK_BG,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusText: {
    color: THEME.MUTED_TEXT,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: SPACING.SM,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default function SettingsScreen() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botToken, setBotToken] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const webhook = await SecureStore.getItemAsync('discord_webhook');
      const token = await SecureStore.getItemAsync('discord_token');
      if (webhook) setWebhookUrl(webhook);
      if (token) setBotToken(token);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      if (webhookUrl) {
        await SecureStore.setItemAsync('discord_webhook', webhookUrl);
      }
      if (botToken) {
        await SecureStore.setItemAsync('discord_token', botToken);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const clearSettings = async () => {
    try {
      await SecureStore.deleteItemAsync('discord_webhook');
      await SecureStore.deleteItemAsync('discord_token');
      setWebhookUrl('');
      setBotToken('');
    } catch (error) {
      console.error('Failed to clear settings:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} scrollEventThrottle={16}>
        {/* Discord Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 DISCORD CONFIGURATION</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Webhook URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://discord.com/api/webhooks/..."
              placeholderTextColor={THEME.MUTED_TEXT}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              secureTextEntry
              editable={true}
            />
            <Text style={styles.statusText}>
              {webhookUrl ? '✓ Webhook configured' : '✗ Not set'}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bot Token (for polling)</Text>
            <TextInput
              style={styles.input}
              placeholder="MTA4NTQxMTA5NTA4NTQxMTA5NTA4"
              placeholderTextColor={THEME.MUTED_TEXT}
              value={botToken}
              onChangeText={setBotToken}
              secureTextEntry
              editable={true}
            />
            <Text style={styles.statusText}>
              {botToken ? '✓ Bot token configured' : '✗ Not set'}
            </Text>
          </View>
        </View>

        {/* Behavior Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ BEHAVIOR</Text>

          <View style={[styles.field, styles.rowBetween]}>
            <Text style={styles.label}>Auto-refresh responses</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: THEME.BORDER_COLOR, true: THEME.ACCENT_GREEN }}
              thumbColor={autoRefresh ? THEME.PRIMARY_GREEN : THEME.MUTED_TEXT}
            />
          </View>

          {autoRefresh && (
            <View style={styles.field}>
              <Text style={styles.label}>Refresh interval (seconds)</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                placeholderTextColor={THEME.MUTED_TEXT}
                value={refreshInterval}
                onChangeText={setRefreshInterval}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={saveSettings}>
            <Text style={styles.buttonText}>💾 SAVE SETTINGS</Text>
          </TouchableOpacity>

          {isSaved && (
            <Text
              style={{
                ...styles.statusText,
                color: THEME.SUCCESS_GREEN,
                textAlign: 'center',
                marginTop: SPACING.MD,
              }}
            >
              ✓ Settings saved successfully
            </Text>
          )}

          <TouchableOpacity
            style={{
              ...styles.button,
              backgroundColor: THEME.ERROR_RED,
              marginTop: SPACING.MD,
            }}
            onPress={clearSettings}
          >
            <Text style={styles.buttonText}>🗑️ CLEAR ALL SETTINGS</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ ABOUT</Text>
          <Text style={styles.statusText}>
            MaxBot Controller{'\n'}
            Version 1.0.0{'\n'}
            Fallout Pip-Boy UI Theme{'\n'}
            © 2024
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
