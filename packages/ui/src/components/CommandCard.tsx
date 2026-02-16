import React from 'react';
import { Command } from '@repo/commands';

interface CommandCardProps {
  command: Command;
  onSelect: (command: Command) => void;
  onFavorite?: (commandId: string) => void;
  isFavorite?: boolean;
}

export const CommandCard: React.FC<CommandCardProps> = ({
  command,
  onSelect,
  onFavorite,
  isFavorite = false,
}) => {
  return (
    <div
      onClick={() => onSelect(command)}
      style={{
        backgroundColor: '#001A00',
        border: '2px solid #00FF41',
        borderRadius: '4px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        marginBottom: '8px',
      }}
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = '#00DD00';
        el.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)';
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = '#00FF41';
        el.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: '#00FF41',
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
          }}
        >
          {command.icon} {command.name}
        </h3>
        {command.dangerous && (
          <span
            style={{
              backgroundColor: '#FF0000',
              color: '#001A00',
              padding: '2px 6px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 'bold',
              marginLeft: '8px',
            }}
          >
            DANGEROUS
          </span>
        )}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(command.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: isFavorite ? '#FF0000' : '#00FF41',
              fontSize: '16px',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            ★
          </button>
        )}
      </div>
      <p
        style={{
          margin: 0,
          color: '#00AA00',
          fontFamily: "'Courier New', monospace",
          fontSize: '12px',
          lineHeight: '1.4',
        }}
      >
        {command.description}
      </p>
    </div>
  );
};
