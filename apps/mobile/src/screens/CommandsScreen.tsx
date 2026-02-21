/**
 * Commands list and execution screen
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { commandManager, type Command } from '@repo/commands';
import { THEME, STATUS } from '@repo/config';
import { appendHistory } from '../lib/storage';
import { SPACING } from '../lib/spacing';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK_BG,
  },
  searchContainer: {
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME.BORDER_COLOR,
  },
  searchInput: {
    backgroundColor: THEME.DARK_BG,
    borderWidth: 2,
    borderColor: THEME.BORDER_COLOR,
    color: THEME.TEXT_COLOR,
    padding: SPACING.SM,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  list: {
    padding: SPACING.MD,
  },
  commandCard: {
    borderWidth: 2,
    borderColor: THEME.BORDER_COLOR,
    borderRadius: 4,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    backgroundColor: THEME.DARK_BG,
  },
  commandName: {
    color: THEME.PRIMARY_GREEN,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  commandDesc: {
    color: THEME.MUTED_TEXT,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: SPACING.SM,
  },
  dangerBadge: {
    backgroundColor: THEME.ERROR_RED,
    color: THEME.DARK_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  emptyText: {
    color: THEME.MUTED_TEXT,
    textAlign: 'center',
    padding: SPACING.LG,
    fontFamily: 'monospace',
  },
});

export default function CommandsScreen() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCommands(commandManager.getAllCommands());
  }, []);

  const filteredCommands = searchQuery
    ? commandManager.searchCommands(searchQuery)
    : commands;

  const executeCommand = useCallback(async (command: Command) => {
    setIsLoading(true);
    try {
      const webhookUrl = await SecureStore.getItemAsync('discord_webhook');
      if (!webhookUrl) {
        Alert.alert('Missing Settings', 'Configure Discord Webhook URL in Settings first.');
        return;
      }

      const startedAt = Date.now();
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `/${command.id}`,
          username: 'MaxBot Controller Mobile',
        }),
      });

      const success = response.ok;
      await appendHistory({
        id: `${command.id}-${startedAt}`,
        commandId: command.id,
        commandName: command.name,
        status: success ? STATUS.SUCCESS : STATUS.ERROR,
        output: success ? 'Sent to Discord webhook' : undefined,
        error: success ? undefined : `HTTP ${response.status}`,
        startTime: startedAt,
        endTime: Date.now(),
        duration: Date.now() - startedAt,
        timestamp: startedAt,
      });

      Alert.alert(
        success ? 'Command Sent' : 'Command Failed',
        success ? `${command.name} queued via Discord.` : `Failed with HTTP ${response.status}`
      );
    } catch (error) {
      const startedAt = Date.now();
      await appendHistory({
        id: `${command.id}-${startedAt}`,
        commandId: command.id,
        commandName: command.name,
        status: STATUS.ERROR,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: startedAt,
        endTime: Date.now(),
        duration: 0,
        timestamp: startedAt,
      });
      Alert.alert('Command Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCommandSelect = useCallback(
    (command: Command) => {
      if (command.dangerous || command.requiresConfirmation) {
        Alert.alert(
          'Confirm Command',
          `Run "${command.name}" now?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Run', style: 'destructive', onPress: () => void executeCommand(command) },
          ]
        );
        return;
      }
      void executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search commands..."
          placeholderTextColor={THEME.MUTED_TEXT}
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!isLoading}
        />
      </View>

      <ScrollView style={styles.list} scrollEventThrottle={16}>
        {filteredCommands.length === 0 ? (
          <Text style={styles.emptyText}>
          {searchQuery ? 'No commands found' : 'Loading commands...'}
          </Text>
        ) : (
          filteredCommands.map((cmd) => (
            <TouchableOpacity
              key={cmd.id}
              style={styles.commandCard}
              onPress={() => handleCommandSelect(cmd)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.commandName}>
                  {cmd.icon} {cmd.name}
                </Text>
                {cmd.dangerous && <Text style={styles.dangerBadge}>DANGEROUS</Text>}
              </View>
              <Text style={styles.commandDesc}>{cmd.description}</Text>
              <Text
                style={{
                  ...styles.commandDesc,
                  fontSize: 11,
                  color: THEME.ACCENT_GREEN,
                }}
              >
                {cmd.parameters.length} parameter(s) • {cmd.category}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={THEME.PRIMARY_GREEN} />
        </View>
      )}
    </View>
  );
}
