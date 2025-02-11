import NextAuth from "next-auth";

import prisma from "@/lib/db";

import Google from "next-auth/providers/google";
const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn(params) {
      if (!params.user.email) {
        return false;
      }

      try {
        await prisma.user.create({
          data: {
            email: params.user.email,
            provider: "Google",
          },
        });
      } catch (error) {}
      return true;
    },
  },
});

export { handler as GET, handler as POST };
