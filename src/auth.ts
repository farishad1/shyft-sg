import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';
import { User } from '@prisma/client';

// Define custom types for NextAuth
declare module 'next-auth' {
    interface User {
        role?: 'ADMIN' | 'WORKER' | 'HOTEL';
    }

    interface Session {
        user: {
            id: string;
            role?: 'ADMIN' | 'WORKER' | 'HOTEL';
            email: string;
        } & import('next-auth').DefaultSession['user'];
    }
}

declare module '@auth/core/jwt' {
    interface JWT {
        role?: 'ADMIN' | 'WORKER' | 'HOTEL';
        id?: string;
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    if (!prisma) {
                        throw new Error('Database connection failed');
                    }

                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) return null;

                    const passwordsMatch = await verifyPassword(password, user.passwordHash);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            email: user.email,
                            role: user.role,
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
