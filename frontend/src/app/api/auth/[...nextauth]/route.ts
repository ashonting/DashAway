import NextAuth, { Account, Profile, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { AdapterUser } from "next-auth/adapters";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
    }) {
      if (account && account.provider === "google") {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: account.id_token }),
          });

          if (response.ok) {
            // Backend sets the httpOnly cookie, so sign-in is successful
            return true;
          } else {
            console.error('Backend Google auth failed:', await response.text());
            return false;
          }
        } catch (error) {
          console.error('Error during Google auth:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to main page after successful login
      return baseUrl;
    },
  },
  pages: {
    error: '/login', // Redirect to login page on error
  },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
