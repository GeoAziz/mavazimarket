import type { NextConfig } from 'next';

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
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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

export default nextConfig;
