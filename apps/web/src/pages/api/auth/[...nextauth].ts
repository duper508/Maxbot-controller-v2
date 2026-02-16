/**
 * NextAuth.js configuration
 * Handles GitHub OAuth authentication and session management
 */

import NextAuth, { type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error('Missing GitHub OAuth credentials: GITHUB_ID and GITHUB_SECRET required');
}

if (!process.env.GITHUB_PAT) {
  throw new Error('Missing GitHub Personal Access Token (GITHUB_PAT) required for collaborator verification');
}

const GITHUB_REPO_OWNER = 'duper508';
const GITHUB_REPO_NAME = 'maxbot-controller';

/**
 * Check if user is a collaborator on the repository
 * Uses dedicated GitHub PAT from environment for authorization
 */
async function checkUserCollaborator(username: string): Promise<boolean> {
  try {
    // Use the server-side GitHub PAT (not the user's token)
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/collaborators/${username}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    // 204 = user is a collaborator, 404 = user is not
    return response.status === 204;
  } catch (error) {
    console.error('Collaborator check failed:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    /**
     * Called on successful sign in
     * Verify user is a collaborator before allowing access
     */
    async signIn({ user }) {
      if (!user?.name) {
        console.error('Missing username');
        return false;
      }

      // Check if user is a collaborator using server-side PAT
      const isCollaborator = await checkUserCollaborator(user.name);

      if (!isCollaborator) {
        console.warn(`User ${user.name} is not a collaborator on the repository`);
        return '/unauthorized';
      }

      return true;
    },

    /**
     * Add custom claims to JWT token
     */
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    /**
     * Add custom claims to session
     */
    async session({ session, token }) {
      if (session.user && token.accessToken) {
        (session.user as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update every 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default NextAuth(authOptions);
