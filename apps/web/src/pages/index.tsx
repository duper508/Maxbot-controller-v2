/**
 * Home page - Command controller dashboard
 * Updated to use secure server-side API routes
 */

import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { commandManager, type Command } from '@repo/commands';
import { THEME, STATUS, type CommandHistoryEntry } from '@repo/config';
import { Button, TerminalDisplay, CommandCard } from '@repo/ui';
import { storage, type StorageManager } from '@/lib/storage';
import {
  executeCommand,
  pollResponses,
  getCommands,
  getHistory,
  deleteHistoryEntry,
} from '@/lib/api-client';

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    background-color: ${THEME.DARK_BG};
    color: ${THEME.PRIMARY_GREEN};
    font-family: 'Courier New', 'OCR-A', monospace;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${THEME.PRIMARY_GREEN};
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
    letter-spacing: 0.05em;
  }

  input, select, textarea {
    background-color: ${THEME.DARK_BG};
    color: ${THEME.PRIMARY_GREEN};
    border: 2px solid ${THEME.BORDER_COLOR};
    font-family: inherit;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 2px;
    transition: all 150ms ease;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${THEME.PRIMARY_GREEN};
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
  }

  input::placeholder {
    color: ${THEME.MUTED_TEXT};
  }

  /* Scanlines effect */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(
      0deg,
      transparent 24%,
      rgba(0, 255, 65, 0.03) 25%,
      rgba(0, 255, 65, 0.03) 26%,
      transparent 27%,
      transparent 74%,
      rgba(0, 255, 65, 0.03) 75%,
      rgba(0, 255, 65, 0.03) 76%,
      transparent 77%,
      transparent
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 999;
  }
`;

interface SelectedCommand {
  command: Command;
  parameters: Record<string, string | number | boolean>;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commands, setCommands] = useState<Command[]>([]);
  const [selectedCmd, setSelectedCmd] = useState<SelectedCommand | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [output, setOutput] = useState('> AWAITING CONNECTION...');
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'commands' | 'history' | 'favorites' | 'settings'>(
    'commands'
  );
  const [storageManager, setStorageManager] = useState<StorageManager | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Initialize
  useEffect(() => {
    if (status !== 'authenticated') return;

    setCommands(commandManager.getAllCommands());

    if (storage) {
      setStorageManager(storage);
      setFavorites(storage.getFavorites());
      setHistory(storage.getHistory());
    }

    setOutput('> SYSTEM ONLINE\n> AUTHENTICATION VERIFIED\n> AWAITING COMMAND');
  }, [status]);

  // Load history from server
  useEffect(() => {
    if (status !== 'authenticated') return;

    const loadHistory = async () => {
      const result = await getHistory(50);
      if (result.success && result.data) {
        setHistory(result.data.history);
      }
    };

    loadHistory();
  }, [status]);

  const handleCommandSelect = useCallback((command: Command) => {
    const params: Record<string, string | number | boolean> = {};
    command.parameters.forEach((param) => {
      if (param.default !== undefined) {
        params[param.id] = param.default;
      } else {
        params[param.id] = '';
      }
    });
    setSelectedCmd({ command, parameters: params });
  }, []);

  const handleParameterChange = (paramId: string, value: unknown) => {
    if (!selectedCmd) return;
    setSelectedCmd({
      ...selectedCmd,
      parameters: {
        ...selectedCmd.parameters,
        [paramId]: value,
      },
    });
  };

  const handleExecute = async () => {
    if (!selectedCmd) {
      setOutput('ERROR: No command selected');
      return;
    }

    setIsLoading(true);
    setOutput(`> EXECUTING: ${selectedCmd.command.name}\n> SENDING TO DISCORD...`);

    try {
      // Validate parameters
      const validation = commandManager.validateParameters(
        selectedCmd.command,
        selectedCmd.parameters
      );
      if (!validation.valid) {
        setOutput(`ERROR: ${validation.errors.join('\n')}`);
        setIsLoading(false);
        return;
      }

      // Execute command via secure API
      const result = await executeCommand(
        selectedCmd.command.id,
        selectedCmd.parameters
      );

      if (!result.success) {
        setOutput(`ERROR: ${result.error || 'Failed to execute'}`);
        setIsLoading(false);
        return;
      }

      const requestId = (result.data as any)?.requestId;
      setOutput(
        `> REQUEST SENT (ID: ${requestId})\n> AWAITING RESPONSE FROM DISCORD...`
      );

      // Poll for real responses from Discord API
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds with 2s intervals
      const pollInterval = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
          clearInterval(pollInterval);
          setOutput(`> TIMEOUT: No response received after ${maxAttempts * 2} seconds`);
          setIsLoading(false);
          return;
        }

        try {
          // Call real poll-response API to get bot messages
          const pollResult = await pollResponses(
            process.env.NEXT_PUBLIC_DISCORD_CHANNEL_ID || '',
            5,
            requestId
          );

          if (pollResult.success && pollResult.data?.messages && pollResult.data.messages.length > 0) {
            clearInterval(pollInterval);
            
            // Display real bot response(s)
            const messages = pollResult.data.messages;
            let outputText = `> RESPONSE RECEIVED (${messages.length} message${messages.length > 1 ? 's' : ''}):\n`;
            
            messages.forEach((msg: any, idx: number) => {
              const author = msg.author?.username || 'Unknown';
              const content = msg.content || '(empty)';
              outputText += `\n[${idx + 1}] ${author}:\n${content}`;
            });
            
            setOutput(outputText + '\n> STATUS: COMPLETED');
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Poll error:', error);
        }

        // Continue polling
        setOutput(
          `> POLLING... (attempt ${attempts}/${maxAttempts})`
        );
      }, 2000);
    } catch (error) {
      setOutput(
        `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = (commandId: string) => {
    if (!storageManager) return;

    if (storageManager.isFavorite(commandId)) {
      storageManager.removeFavorite(commandId);
      setFavorites(storageManager.getFavorites());
    } else {
      storageManager.addFavorite(commandId);
      setFavorites(storageManager.getFavorites());
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleDeleteHistoryEntry = async (entryId: string) => {
    const result = await deleteHistoryEntry(entryId);
    if (result.success) {
      setHistory(history.filter((h) => h.id !== entryId));
    }
  };

  if (status === 'loading') {
    return (
      <>
        <Head>
          <title>MaxBot Controller - Loading</title>
          <style>{styles}</style>
        </Head>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: THEME.DARK_BG,
            color: THEME.PRIMARY_GREEN,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1>INITIALIZING...</h1>
            <p style={{ color: THEME.MUTED_TEXT }}>Establishing connection...</p>
          </div>
        </div>
      </>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const filteredCommands = searchQuery
    ? commandManager.searchCommands(searchQuery)
    : commands;

  const favoriteCommands = filteredCommands.filter((cmd) =>
    favorites.includes(cmd.id)
  );

  return (
    <>
      <Head>
        <title>MaxBot Controller - Pip-Boy Terminal</title>
        <meta name="description" content="Fallout Pip-Boy themed command controller" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{styles}</style>
      </Head>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: THEME.DARK_BG,
          color: THEME.PRIMARY_GREEN,
        }}
      >
        {/* Header with User Info */}
        <div
          style={{
            borderBottom: `2px solid ${THEME.BORDER_COLOR}`,
            padding: '16px',
            backgroundColor: `${THEME.DARK_BG}dd`,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '28px',
                textTransform: 'uppercase',
              }}
            >
              ⚙️ CLAWDBOT CONTROLLER
            </h1>
            <p
              style={{
                margin: 0,
                color: THEME.MUTED_TEXT,
                fontSize: '12px',
                letterSpacing: '0.1em',
              }}
            >
              FALLOUT PIP-BOY COMMAND INTERFACE v1.0 | SECURE AUTHORIZATION ACTIVE
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                color: THEME.ACCENT_GREEN,
              }}
            >
              ✓ {session?.user?.email}
            </p>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: THEME.PRIMARY_GREEN,
                border: `1px solid ${THEME.PRIMARY_GREEN}`,
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => {
                const el = e.target as HTMLButtonElement;
                el.style.backgroundColor = THEME.PRIMARY_GREEN;
                el.style.color = THEME.DARK_BG;
              }}
              onMouseOut={(e) => {
                const el = e.target as HTMLButtonElement;
                el.style.backgroundColor = 'transparent';
                el.style.color = THEME.PRIMARY_GREEN;
              }}
            >
              🚪 LOGOUT
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '16px',
            flex: 1,
            overflow: 'hidden',
            padding: '16px',
          }}
        >
          {/* Left Panel - Commands */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRight: `2px solid ${THEME.BORDER_COLOR}`,
              paddingRight: '16px',
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                borderBottom: `1px solid ${THEME.BORDER_COLOR}`,
                paddingBottom: '8px',
              }}
            >
              {(['commands', 'history', 'favorites', 'settings'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor:
                        activeTab === tab ? THEME.PRIMARY_GREEN : 'transparent',
                      color:
                        activeTab === tab ? THEME.DARK_BG : THEME.PRIMARY_GREEN,
                      border: `1px solid ${THEME.PRIMARY_GREEN}`,
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      transition: 'all 150ms ease',
                    }}
                    onMouseOver={(e) => {
                      const el = e.target as HTMLButtonElement;
                      if (activeTab !== tab) {
                        el.style.boxShadow =
                          '0 0 10px rgba(0, 255, 65, 0.2)';
                      }
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLButtonElement).style.boxShadow =
                        'none';
                    }}
                  >
                    {tab === 'commands'
                      ? '📋'
                      : tab === 'history'
                      ? '⏱️'
                      : tab === 'favorites'
                      ? '⭐'
                      : '⚙️'}
                    {' '}
                    {tab.toUpperCase()}
                  </button>
                )
              )}
            </div>

            {/* Commands List */}
            {(activeTab === 'commands' || activeTab === 'favorites') && (
              <>
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                <div
                  style={{
                    flex: 1,
                    overflow: 'auto',
                    paddingRight: '8px',
                  }}
                >
                  {(activeTab === 'favorites'
                    ? favoriteCommands
                    : filteredCommands
                  ).map((cmd) => (
                    <CommandCard
                      key={cmd.id}
                      command={cmd}
                      onSelect={handleCommandSelect}
                      onFavorite={handleFavoriteToggle}
                      isFavorite={favorites.includes(cmd.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  fontSize: '12px',
                  paddingRight: '8px',
                }}
              >
                {history.length === 0 ? (
                  <p style={{ color: THEME.MUTED_TEXT }}>No history yet</p>
                ) : (
                  history.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '8px',
                        marginBottom: '8px',
                        backgroundColor: `${THEME.PRIMARY_GREEN}11`,
                        border: `1px solid ${THEME.BORDER_COLOR}`,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        onClick={() =>
                          setOutput(
                            `${entry.commandName}: ${entry.output || 'N/A'}`
                          )
                        }
                        style={{ flex: 1 }}
                      >
                        <div
                          style={{
                            color: THEME.ACCENT_GREEN,
                            fontWeight: 'bold',
                          }}
                        >
                          {entry.commandName}
                        </div>
                        <div
                          style={{
                            color: THEME.MUTED_TEXT,
                            fontSize: '10px',
                          }}
                        >
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHistoryEntry(entry.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          color: '#FF0000',
                          border: '1px solid #FF0000',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          marginLeft: '8px',
                        }}
                        onMouseOver={(e) => {
                          const el = e.target as HTMLButtonElement;
                          el.style.backgroundColor = '#FF0000';
                          el.style.color = THEME.DARK_BG;
                        }}
                        onMouseOut={(e) => {
                          const el = e.target as HTMLButtonElement;
                          el.style.backgroundColor = 'transparent';
                          el.style.color = '#FF0000';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div
                style={{
                  flex: 1,
                  fontSize: '12px',
                  color: THEME.MUTED_TEXT,
                }}
              >
                <h3 style={{ color: THEME.PRIMARY_GREEN }}>System Status</h3>
                <p>✓ Authentication: Active</p>
                <p>✓ API Connection: Secure</p>
                <p>✓ Rate Limiting: Enabled</p>
                <p>Favorites: {favorites.length}</p>
                <p>History: {history.length} entries</p>
                <h3 style={{ color: THEME.PRIMARY_GREEN, marginTop: '20px' }}>
                  Security
                </h3>
                <p style={{ fontSize: '11px', lineHeight: '1.6' }}>
                  • All secrets server-side<br />
                  • JWT session tokens<br />
                  • Rate-limited API endpoints<br />
                  • CSRF protection active<br />
                  • GitHub collaborator verified
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Command Details & Output */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Command Details */}
            {selectedCmd && (
              <div
                style={{
                  border: `2px solid ${THEME.BORDER_COLOR}`,
                  borderRadius: '4px',
                  padding: '16px',
                  backgroundColor: `${THEME.DARK_BG}dd`,
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: '8px' }}>
                  {selectedCmd.command.icon} {selectedCmd.command.name}
                </h2>
                <p
                  style={{
                    color: THEME.MUTED_TEXT,
                    marginBottom: '16px',
                  }}
                >
                  {selectedCmd.command.description}
                </p>

                {/* Parameters */}
                {selectedCmd.command.parameters.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '14px' }}>
                      PARAMETERS
                    </h3>
                    <div
                      style={{
                        display: 'grid',
                        gap: '12px',
                      }}
                    >
                      {selectedCmd.command.parameters.map((param) => (
                        <div key={param.id}>
                          <label
                            style={{
                              display: 'block',
                              marginBottom: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {param.name}
                            {param.required && ' *'}
                          </label>
                          {param.type === 'select' ? (
                            <select
                              value={selectedCmd.parameters[param.id] || ''}
                              onChange={(e) =>
                                handleParameterChange(
                                  param.id,
                                  e.target.value
                                )
                              }
                              style={{ width: '100%' }}
                            >
                              <option value="">-- Select --</option>
                              {param.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : param.type === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={
                                (selectedCmd.parameters[param.id] as boolean) ||
                                false
                              }
                              onChange={(e) =>
                                handleParameterChange(
                                  param.id,
                                  e.target.checked
                                )
                              }
                            />
                          ) : (
                            <input
                              type={
                                param.type === 'number' ? 'number' : 'text'
                              }
                              placeholder={param.placeholder}
                              value={selectedCmd.parameters[param.id] || ''}
                              onChange={(e) =>
                                handleParameterChange(
                                  param.id,
                                  param.type === 'number'
                                    ? parseFloat(e.target.value)
                                    : e.target.value
                                )
                              }
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                <Button
                  onPress={handleExecute}
                  disabled={isLoading}
                  danger={selectedCmd.command.dangerous}
                >
                  {selectedCmd.command.dangerous
                    ? '⚠️ EXECUTE (DANGEROUS)'
                    : '▶ EXECUTE COMMAND'}
                </Button>
              </div>
            )}

            {/* Output */}
            <TerminalDisplay content={output} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
}
