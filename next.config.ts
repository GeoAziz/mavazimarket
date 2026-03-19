import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        path: false,
        stream: false,
        util: false,
        crypto: require.resolve('crypto-browserify'),
        http: false,
        https: false,
        zlib: false,
        http2: false,
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['http://localhost:3000']
    }
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options (only applied at build time).
  // Suppresses source-map upload warnings during local builds.
  silent: true,
  // Automatically tree-shake Sentry logger statements in production.
  disableLogger: true,
});
