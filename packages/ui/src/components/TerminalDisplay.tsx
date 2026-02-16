import React from 'react';

interface TerminalDisplayProps {
  content: string;
  isLoading?: boolean;
}

export const TerminalDisplay: React.FC<TerminalDisplayProps> = ({
  content,
  isLoading = false,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#001A00',
        border: '2px solid #00FF41',
        borderRadius: '4px',
        padding: '16px',
        fontFamily: "'Courier New', 'OCR-A', monospace",
        fontSize: '12px',
        lineHeight: '1.6',
        color: '#00FF41',
        minHeight: '200px',
        maxHeight: '400px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        backgroundImage: `
          linear-gradient(
            0deg,
            transparent 24%,
            rgba(0, 255, 65, 0.05) 25%,
            rgba(0, 255, 65, 0.05) 26%,
            transparent 27%,
            transparent 74%,
            rgba(0, 255, 65, 0.05) 75%,
            rgba(0, 255, 65, 0.05) 76%,
            transparent 77%,
            transparent
          )
        `,
        backgroundSize: '100% 4px',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 10px rgba(0, 255, 65, 0.1)',
      }}
    >
      {content || (isLoading ? '> EXECUTING...' : '> AWAITING INPUT')}
      {isLoading && (
        <span
          style={{
            animation: 'blink 1s infinite',
            marginLeft: '4px',
          }}
        >
          _
        </span>
      )}
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
