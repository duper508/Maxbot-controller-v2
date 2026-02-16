/**
 * Command execution history screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { THEME, SPACING, type CommandHistoryEntry } from '@repo/config';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK_BG,
  },
  content: {
    padding: SPACING.MD,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: THEME.BORDER_COLOR,
    borderRadius: 4,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    backgroundColor: `${THEME.PRIMARY_GREEN}11`,
  },
  itemName: {
    color: THEME.PRIMARY_GREEN,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  itemTime: {
    color: THEME.MUTED_TEXT,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: SPACING.SM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.PRIMARY_GREEN,
    borderRadius: 2,
  },
  clearButtonText: {
    color: THEME.DARK_BG,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    color: THEME.MUTED_TEXT,
    textAlign: 'center',
    padding: SPACING.LG,
    fontFamily: 'monospace',
  },
});

export default function HistoryScreen() {
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);

  useEffect(() => {
    // TODO: Load from storage
    // For now, use placeholder
    setHistory([]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return { backgroundColor: `${THEME.SUCCESS_GREEN}33`, color: THEME.SUCCESS_GREEN };
      case 'error':
        return { backgroundColor: `${THEME.ERROR_RED}33`, color: THEME.ERROR_RED };
      case 'timeout':
        return { backgroundColor: `${THEME.ACCENT_GREEN}33`, color: THEME.ACCENT_GREEN };
      default:
        return { backgroundColor: `${THEME.MUTED_TEXT}33`, color: THEME.MUTED_TEXT };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={{ color: THEME.PRIMARY_GREEN, fontFamily: 'monospace', fontSize: 12 }}>
            {history.length} entries
          </Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                // TODO: Implement clear history
                setHistory([]);
              }}
            >
              <Text style={styles.clearButtonText}>CLEAR ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView scrollEventThrottle={16}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No history yet. Execute a command to see it here.</Text>
          ) : (
            history.map((entry) => (
              <TouchableOpacity key={entry.id} style={styles.historyItem} activeOpacity={0.8}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.itemName}>{entry.commandName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      getStatusColor(entry.status),
                    ]}
                  >
                    <Text style={{ color: getStatusColor(entry.status).color }}>
                      {entry.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemTime}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                {entry.duration && (
                  <Text style={styles.itemTime}>
                    Duration: {(entry.duration / 1000).toFixed(2)}s
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
