import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token }) => {
      // Require a valid token (user must be authenticated)
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    '/',
    '/discover/:path*',
    '/favorites/:path*',
    '/trending/:path*',
  ],
};
