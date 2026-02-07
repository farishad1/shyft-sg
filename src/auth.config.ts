import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register',
        error: '/auth/error',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            if (isOnAdmin) {
                // Strict admin check
                if (isLoggedIn && auth?.user?.role === 'ADMIN') return true;
                return false;
            }

            return true;
        },
        // Add role to session
        session({ session, token }) {
            if (token.role && session.user) {
                session.user.role = token.role as 'ADMIN' | 'WORKER' | 'HOTEL';
                session.user.id = token.id as string;
            }
            return session;
        },
        // Add role to token
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
