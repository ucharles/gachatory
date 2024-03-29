import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongodb";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import type { GoogleProfile } from "next-auth/providers/google";
import type { GithubProfile } from "next-auth/providers/github";
import type { GithubEmail } from "next-auth/providers/github";
import type { DiscordProfile } from "next-auth/providers/discord";

export const options: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile: GoogleProfile) {
        const currentUTCDateString = new Date().toISOString();
        return {
          id: profile.sub as string,
          name: profile.name as string,
          email: profile.email as string,
          provider: "google",
          emailVerified: profile.email_verified as boolean,
          loggedAt: currentUTCDateString,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      profile(profile: GithubProfile & GithubEmail) {
        const currentUTCDateString = new Date().toISOString();
        return {
          id: profile.id.toString(),
          name: profile.name as string,
          email: profile.email as string,
          provider: "github",
          emailVerified: profile.verified as boolean,
          loggedAt: currentUTCDateString,
        };
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      profile(profile: DiscordProfile) {
        const currentUTCDateString = new Date().toISOString();
        return {
          id: profile.id as string,
          name: profile.username as string,
          email: profile.email as string,
          provider: "discord",
          emailVerified: profile.verified as boolean,
          loggedAt: currentUTCDateString,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    // We can pass in additional information from the user document MongoDB returns
    async jwt({ token, user, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.provider = user.provider;
        token.createdAt = user.createdAt;
        token.loggedAt = user.loggedAt;
      }
      return token;
    },
    // If we want to access our extra user info from sessions we have to pass it the token here to get them in sync:
    async session({ session, token, user }: any) {
      session.accessToken = token.accessToken;
      if (token) {
        session.user.id = token.sub;
        session.user.provider = token.provider;
        session.user.createdAt = token.createdAt;
        session.user.loggedAt = token.loggedAt;
      }
      return session;
    },
  },
};
