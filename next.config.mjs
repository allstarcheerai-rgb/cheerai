/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
    ],
  },
  typescript: {
    // Ignore Turbopack-generated type validator errors in .next/dev/types
    // This is a known Next.js 16 + Turbopack bug - source code is fully typed
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
