import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: () => {
      // Allow dashboard demo preview; user can also sign in/out at any time
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
