import NextAuth, { Account, Profile, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      credentials?: Record<string, any>;
    }) {
      if (account && account.provider === "google") {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: account.id_token }),
        });

        if (response.ok) {
          const data = await response.json();
          // How do we get the access token to the client?
          // We can't set a cookie here, because this is a server-side callback.
          // We could return the token in the JWT, but that's not ideal.
          // For now, we'll just return true and assume the backend sets the cookie.
          return true;
        }
        return false;
      }
      return true;
    },
  },
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
