/**
 * Login page - GitHub OAuth authentication
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
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

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [status, session, router]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn('github', { redirect: true, callbackUrl: '/' });
    } catch (err) {
      setError('Failed to sign in with GitHub');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MaxBot Controller - Login</title>
        <meta name="description" content="Authenticate with GitHub to access MaxBot Controller" />
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
            border: `2px solid ${THEME.BORDER_COLOR}`,
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
            }}
          >
            ⚙️ CLAWDBOT CONTROLLER
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
            FALLOUT PIP-BOY COMMAND INTERFACE v1.0
          </p>

          {/* Terminal-style divider */}
          <div
            style={{
              borderTop: `1px solid ${THEME.BORDER_COLOR}`,
              borderBottom: `1px solid ${THEME.BORDER_COLOR}`,
              padding: '12px 0',
              margin: '24px 0',
              textAlign: 'center',
              fontSize: '12px',
              color: THEME.MUTED_TEXT,
            }}
          >
            SECURITY AUTHENTICATION REQUIRED
          </div>

          {/* Content */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', marginBottom: '16px' }}>
              🔐 SIGN IN WITH GITHUB
            </h2>

            <p
              style={{
                fontSize: '12px',
                color: THEME.MUTED_TEXT,
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
            >
              You must be a collaborator on the{' '}
              <code style={{ color: THEME.ACCENT_GREEN }}>duper508/maxbot-controller</code>{' '}
              repository to access this application.
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid #FF0000',
                  borderRadius: '2px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#FF0000',
                }}
              >
                ✗ {error}
              </div>
            )}

            {(router.query.error === 'AccessDenied' ||
              router.query.error === 'Callback') && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 170, 0, 0.1)',
                  border: '1px solid #FFAA00',
                  borderRadius: '2px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#FFAA00',
                }}
              >
                ⚠ You must be a collaborator to access this application
              </div>
            )}
          </div>

          {/* GitHub Login Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: THEME.PRIMARY_GREEN,
              color: THEME.DARK_BG,
              border: 'none',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 150ms ease',
              opacity: isLoading ? 0.6 : 1,
              textShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.boxShadow =
                  '0 0 20px rgba(0, 255, 65, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            {isLoading ? '⏳ CONNECTING...' : '▶ SIGN IN WITH GITHUB'}
          </button>

          {/* Info */}
          <div
            style={{
              marginTop: '24px',
              padding: '12px',
              borderTop: `1px solid ${THEME.BORDER_COLOR}`,
              fontSize: '11px',
              color: THEME.MUTED_TEXT,
              lineHeight: '1.6',
            }}
          >
            <p style={{ margin: 0, marginBottom: '8px' }}>
              ℹ️ <strong>Authentication Details:</strong>
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
              }}
            >
              <li>OAuth 2.0 via GitHub</li>
              <li>Session stored securely (JWT)</li>
              <li>Automatic token management</li>
              <li>Requires collaborator access</li>
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
          By signing in, you agree to authorize access to your GitHub account.
          <br />
          Only repository collaborators can access this application.
        </p>
      </div>
    </>
  );
}
