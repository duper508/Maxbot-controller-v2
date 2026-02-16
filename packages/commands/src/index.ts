/**
 * Command management and utilities
 */

import { Command, CommandGroup, CommandParameter } from './types';
import commandsData from './commands.json';

export * from './types';

export class CommandManager {
  private commands: Map<string, Command> = new Map();

  constructor() {
    this.loadCommands(commandsData.commands);
  }

  private loadCommands(commands: Command[]) {
    commands.forEach((cmd) => {
      this.commands.set(cmd.id, cmd);
    });
  }

  /**
   * Get a command by ID
   */
  getCommand(id: string): Command | undefined {
    return this.commands.get(id);
  }

  /**
   * Get all commands
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands grouped by category
   */
  getCommandsByCategory(): CommandGroup[] {
    const groups = new Map<string, Command[]>();

    this.commands.forEach((cmd) => {
      if (!groups.has(cmd.category)) {
        groups.set(cmd.category, []);
      }
      groups.get(cmd.category)!.push(cmd);
    });

    return Array.from(groups.entries()).map(([category, commands]) => ({
      category,
      label: this.formatCategoryLabel(category),
      description: this.getCategoryDescription(category),
      icon: this.getCategoryIcon(category),
      commands: commands.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }

  /**
   * Search commands
   */
  searchCommands(query: string): Command[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllCommands().filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get dangerous commands that require confirmation
   */
  getDangerousCommands(): Command[] {
    return this.getAllCommands().filter((cmd) => cmd.dangerous);
  }

  /**
   * Validate command parameters
   */
  validateParameters(
    command: Command,
    params: Record<string, unknown>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    command.parameters.forEach((param) => {
      const value = params[param.id];

      // Check required parameters
      if (param.required && (value === undefined || value === null || value === '')) {
        errors.push(`Parameter "${param.name}" is required`);
        return;
      }

      if (value === undefined || value === null) {
        return;
      }

      // Type validation
      if (param.type === 'number' && typeof value !== 'number') {
        errors.push(`Parameter "${param.name}" must be a number`);
      } else if (param.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Parameter "${param.name}" must be a boolean`);
      } else if (param.type === 'select' && !param.options?.includes(String(value))) {
        errors.push(
          `Parameter "${param.name}" must be one of: ${param.options?.join(', ')}`
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private formatCategoryLabel(category: string): string {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      system: 'System administration and diagnostics',
      network: 'Network operations and diagnostics',
      processes: 'Process management and monitoring',
      storage: 'Disk and storage operations',
      development: 'Development and version control tools',
      containers: 'Docker and container management',
      environment: 'Environment configuration and variables',
      performance: 'Performance monitoring and benchmarking',
    };
    return descriptions[category] || 'Commands';
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      system: '⚙️',
      network: '🌐',
      processes: '⚡',
      storage: '💾',
      development: '🔀',
      containers: '🐳',
      environment: '🌍',
      performance: '⚡',
    };
    return icons[category] || '📦';
  }
}

export const commandManager = new CommandManager();
