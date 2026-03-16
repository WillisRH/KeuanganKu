import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [GitHub, Google],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/auth") || nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname.startsWith("/s/");
      
      if (!isLoggedIn && !isPublicPage) {
        return false; // Redirect to sign-in
      }
      return true;
    },
  },
} satisfies NextAuthConfig
