import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generator/:path*',
    '/projects/:path*',
    '/settings/:path*',
    '/api/generate/:path*',
    '/api/projects/:path*',
    '/api/stripe/checkout',
  ],
};
