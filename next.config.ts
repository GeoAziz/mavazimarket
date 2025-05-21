import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // For server-side bundles, treat these Node.js core modules as externals.
    // This prevents "Module not found" errors for 'child_process', 'fs', 'os'
    // often encountered with libraries like firebase-admin (via google-auth-library).
    if (isServer) {
      config.externals = [...config.externals, 'child_process', 'fs', 'os'];
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
