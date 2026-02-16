/**
 * Command type definitions
 */

export interface CommandParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  default?: string | number | boolean;
  options?: string[]; // for 'select' type
  placeholder?: string;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  parameters: CommandParameter[];
  timeout?: number; // milliseconds
  requiresConfirmation?: boolean;
  dangerous?: boolean;
}

export interface CommandGroup {
  category: string;
  label: string;
  description: string;
  icon?: string;
  commands: Command[];
}

export interface CommandRequest {
  commandId: string;
  parameters: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface CommandResponse {
  requestId: string;
  commandId: string;
  status: 'success' | 'error' | 'timeout';
  output?: string;
  error?: string;
  timestamp: number;
  duration: number;
}
