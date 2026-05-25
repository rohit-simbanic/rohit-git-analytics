import NextAuth, { Session, User, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.GITHUB_SECRET || "MOCK_CLIENT_SECRET",
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
    CredentialsProvider({
      name: "Terminal Auth",
      credentials: {
        username: { label: "Hacker ID", type: "text" },
        password: { label: "Bypass Code", type: "password" },
      },
      async authorize(credentials) {
        if (credentials) {
          const userHandle = credentials.username.trim() || "@steipete";
          return {
            id: "operator-01",
            name: userHandle.startsWith("@") ? userHandle : `@${userHandle}`,
            email: "operator@secured.terminal",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT & { username?: string } }) {
      if (session.user && token.username) {
        session.user.name = token.username;
      }
      return session;
    },
    async jwt({ token, profile, user }: { token: JWT & { username?: string }; profile?: Profile & { login?: string }; user?: User }) {
      if (profile && profile.login) {
        token.username = `@${profile.login}`;
      } else if (user && user.name) {
        token.username = user.name;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "cyber-secret-key-998877",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
