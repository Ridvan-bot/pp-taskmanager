import NextAuth from 'next-auth';
import { Session as NextAuthSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { supabase } from '@/lib/supaBase';
dotenv.config();

interface Session extends NextAuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error('Credentials are required');
        }

        const { data: user } = await supabase
          .from('User')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return { id: user.id.toString(), name: user.name, email: user.email };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { data: existingUser } = await supabase
          .from('User')
          .select('id')
          .eq('email', user.email || '')
          .single();

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(randomBytes(16).toString('hex'), 10);
          await supabase
            .from('User')
            .insert([{ name: user.name || '', email: user.email || '', password: hashedPassword }]);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Validate that the user still exists in the database
        try {
          const { data: user } = await supabase
            .from('User')
            .select('id')
            .eq('id', token.id as string)
            .single();
          
          if (!user) {
            // User no longer exists in database, invalidate session
            console.error('Session validation failed: User not found');
            throw new Error('User not found');
          }
          
          (session as Session).user.id = token.id as string;
        } catch (error) {
          // If user doesn't exist, throw error to invalidate session
          console.error('Session validation failed:', error);
          throw error;
        }
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  debug: true,
  
});

