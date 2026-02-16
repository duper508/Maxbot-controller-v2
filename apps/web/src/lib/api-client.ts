/**
 * Client-side API client
 * Uses secure server-side API routes
 * NEVER exposes secrets to browser
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ExecuteCommandRequest {
  commandId: string;
  parameters: Record<string, unknown>;
}

interface ExecuteCommandResponse {
  requestId: string;
  message: string;
}

interface CommandInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  parameters: any[];
  dangerous?: boolean;
}

interface PollResponseData {
  messages: any[];
}

interface HistoryEntry {
  id: string;
  commandId: string;
  commandName: string;
  status: string;
  output?: string;
  error?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  timestamp: number;
}

interface HistoryStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  pendingExecutions: number;
}

/**
 * Helper to make API calls
 */
async function apiCall<T = any>(
  method: string,
  path: string,
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(path, options);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: `Invalid response: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute a command via secure API
 */
export async function executeCommand(
  commandId: string,
  parameters: Record<string, unknown>
): Promise<ApiResponse<ExecuteCommandResponse>> {
  return apiCall<ExecuteCommandResponse>('POST', '/api/execute-command', {
    commandId,
    parameters,
  });
}

/**
 * Poll for bot responses
 */
export async function pollResponses(
  channelId: string,
  limit?: number,
  after?: string
): Promise<ApiResponse<PollResponseData>> {
  const params = new URLSearchParams();
  params.append('channelId', channelId);
  if (limit) params.append('limit', String(limit));
  if (after) params.append('after', after);

  return apiCall<PollResponseData>('GET', `/api/poll-response?${params}`);
}

/**
 * Get list of available commands
 */
export async function getCommands(
  search?: string,
  category?: string
): Promise<ApiResponse<{ commands: CommandInfo[]; total: number }>> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);

  return apiCall<{ commands: CommandInfo[]; total: number }>(
    'GET',
    `/api/commands?${params}`
  );
}

/**
 * Get execution history
 */
export async function getHistory(
  limit?: number
): Promise<
  ApiResponse<{
    history: HistoryEntry[];
    stats: HistoryStats;
  }>
> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', String(limit));

  return apiCall<{ history: HistoryEntry[]; stats: HistoryStats }>(
    'GET',
    `/api/history?${params}`
  );
}

/**
 * Delete history entry
 */
export async function deleteHistoryEntry(id: string): Promise<ApiResponse<void>> {
  const params = new URLSearchParams();
  params.append('id', id);

  return apiCall<void>('DELETE', `/api/history?${params}`);
}

/**
 * Check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session');
    const data = await response.json();
    return !!data?.user;
  } catch {
    return false;
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<any> {
  try {
    const response = await fetch('/api/auth/session');
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await fetch('/api/auth/signout', { method: 'POST' });
}
