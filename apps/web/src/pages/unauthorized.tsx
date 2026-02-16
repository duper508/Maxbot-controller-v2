/**
 * Unauthorized page - User is not a collaborator
 */

import React from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import Head from 'next/head';
import { THEME } from '@repo/config';

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

  h1, h2 {
    color: ${THEME.PRIMARY_GREEN};
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
    letter-spacing: 0.05em;
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

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>MaxBot Controller - Access Denied</title>
        <meta name="description" content="You do not have access to MaxBot Controller" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{styles}</style>
      </Head>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: THEME.DARK_BG,
          color: THEME.PRIMARY_GREEN,
          padding: '20px',
        }}
      >
        <div
          style={{
            border: `2px solid #FF0000`,
            borderRadius: '4px',
            padding: '48px 32px',
            maxWidth: '500px',
            width: '100%',
            backgroundColor: `${THEME.DARK_BG}dd`,
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Header */}
          <h1
            style={{
              textAlign: 'center',
              margin: '0 0 12px 0',
              fontSize: '28px',
              textTransform: 'uppercase',
              color: '#FF0000',
              textShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
            }}
          >
            ⛔ ACCESS DENIED
          </h1>

          <p
            style={{
              textAlign: 'center',
              color: THEME.MUTED_TEXT,
              fontSize: '12px',
              letterSpacing: '0.1em',
              margin: '0 0 32px 0',
            }}
          >
            UNAUTHORIZED USER
          </p>

          {/* Terminal-style divider */}
          <div
            style={{
              borderTop: `1px solid #FF0000`,
              borderBottom: `1px solid #FF0000`,
              padding: '12px 0',
              margin: '24px 0',
              textAlign: 'center',
              fontSize: '12px',
              color: '#FF0000',
            }}
          >
            ERROR: ACCESS LEVEL INSUFFICIENT
          </div>

          {/* Content */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                marginTop: 0,
                fontSize: '16px',
                marginBottom: '16px',
                color: '#FF0000',
              }}
            >
              🔒 RESTRICTED ACCESS
            </h2>

            <p
              style={{
                fontSize: '12px',
                color: THEME.MUTED_TEXT,
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
            >
              Your GitHub account is not authorized to access MaxBot Controller.
            </p>

            <div
              style={{
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid #FF0000',
                borderRadius: '2px',
                padding: '16px',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              <p style={{ margin: 0, marginBottom: '8px', color: '#FF0000' }}>
                ✗ You must be a collaborator on:{' '}
                <code style={{ color: '#FF0000' }}>duper508/maxbot-controller</code>
              </p>
              <p style={{ margin: 0, color: THEME.MUTED_TEXT }}>
                Please contact a repository administrator to request access.
              </p>
            </div>

            <p
              style={{
                fontSize: '12px',
                color: THEME.MUTED_TEXT,
                lineHeight: '1.6',
              }}
            >
              <strong>What this means:</strong>
              <br />• Your GitHub account was recognized<br />
              • However, you are not listed as a collaborator
              <br />• Only approved collaborators can access this system
            </p>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <button
              onClick={handleBackToLogin}
              style={{
                padding: '12px 16px',
                backgroundColor: THEME.PRIMARY_GREEN,
                color: THEME.DARK_BG,
                border: 'none',
                borderRadius: '2px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow =
                  '0 0 20px rgba(0, 255, 65, 0.5)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              ↩ TRY ANOTHER ACCOUNT
            </button>

            <button
              onClick={handleSignOut}
              style={{
                padding: '12px 16px',
                backgroundColor: 'transparent',
                color: THEME.PRIMARY_GREEN,
                border: `1px solid ${THEME.PRIMARY_GREEN}`,
                borderRadius: '2px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.backgroundColor = THEME.PRIMARY_GREEN;
                btn.style.color = THEME.DARK_BG;
              }}
              onMouseOut={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.backgroundColor = 'transparent';
                btn.style.color = THEME.PRIMARY_GREEN;
              }}
            >
              🚪 SIGN OUT
            </button>
          </div>

          {/* Help Info */}
          <div
            style={{
              padding: '12px',
              borderTop: `1px solid ${THEME.BORDER_COLOR}`,
              fontSize: '11px',
              color: THEME.MUTED_TEXT,
              lineHeight: '1.6',
            }}
          >
            <p style={{ margin: 0, marginBottom: '8px' }}>
              ℹ️ <strong>Need Help?</strong>
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
              }}
            >
              <li>Check you are signed in with the correct GitHub account</li>
              <li>Verify you have been added as a collaborator</li>
              <li>Contact @duper508 to request access</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: '32px',
            fontSize: '11px',
            color: THEME.MUTED_TEXT,
            textAlign: 'center',
          }}
        >
          MaxBot Controller © 2024 | Secure Authorization Required
        </p>
      </div>
    </>
  );
}
