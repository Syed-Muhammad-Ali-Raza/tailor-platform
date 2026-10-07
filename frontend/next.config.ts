import type { NextConfig } from 'next';

const target = process.env.API_PROXY_TARGET || 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${target}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${target}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
