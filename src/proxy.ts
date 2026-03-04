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
    '/templates/:path*',
    '/image-generator/:path*',
    '/projects/:path*',
    '/settings/:path*',
    '/api/generate/:path*',
    '/api/projects/:path*',
    '/api/templates/:path*',
    '/api/stripe/checkout',
  ],
};
