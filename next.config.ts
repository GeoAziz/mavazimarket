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
  webpack: (config, { isServer, webpack }) => {
    // For server-side bundles, treat these Node.js core modules as externals.
    // This prevents "Module not found" errors for 'child_process', 'fs', 'os'
    // often encountered with libraries like firebase-admin (via google-auth-library).
    if (isServer) {
      // Ensure existing externals are preserved correctly.
      // config.externals can be an array, an object, a function, or a regex.
      // We will add our specific externals as an object to the existing array if it is one.
      const existingExternals = Array.isArray(config.externals) ? config.externals : (config.externals ? [config.externals] : []);
      
      config.externals = [
        ...existingExternals,
        // Add an object to specifically handle these Node.js built-ins
        // This tells Webpack to treat these as external commonjs modules.
        {
          'child_process': 'commonjs child_process',
          'fs': 'commonjs fs',
          'os': 'commonjs os',
          // You might need to add other Node.js built-ins here if similar errors appear for them
        },
      ];
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
