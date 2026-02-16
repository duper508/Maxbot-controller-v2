import React from 'react';

interface ButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  danger = false,
  children,
  testID,
}) => {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      data-testid={testID}
      style={{
        padding: '8px 16px',
        fontSize: '14px',
        fontFamily: "'Courier New', monospace",
        backgroundColor: danger ? '#FF0000' : '#00FF41',
        color: '#001A00',
        border: '2px solid #00FF41',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        transition: 'all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          (e.target as HTMLButtonElement).style.textShadow = '0 0 10px rgba(0, 255, 65, 0.5)';
          (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)';
        }
      }}
      onMouseOut={(e) => {
        (e.target as HTMLButtonElement).style.textShadow = 'none';
        (e.target as HTMLButtonElement).style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
};
