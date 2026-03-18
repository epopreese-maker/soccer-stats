/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crests.football-data.org',
        pathname: '/**',
      },
    ],
  },
  // Enable static export compatibility
  experimental: {
    // Allow ISR with fallback on Vercel free tier
  },
}

module.exports = nextConfig
