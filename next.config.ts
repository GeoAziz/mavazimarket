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
        // For certain environments, especially if using newer Node.js features or specific libraries,
        // you might also need to ensure that some modules that are conditionally required by firebase-admin
        // or its dependencies are handled. The following is a common set for firebase-admin.
        // However, the 'commonjs <module>' approach above is usually more targeted for direct 'Module not found'.
        // If the above doesn't work, you might also try simply adding them as strings like before,
        // but the object notation is generally more precise for how they should be externalized.
        // For now, focusing on the direct error source:
      ];

      // An alternative or additional way for certain module types, if the above is not enough:
      // config.module.rules.push({
      //   test: /node_modules\/firebase-admin/,
      //   loader: 'ignore-loader', // or handle specific sub-dependencies
      // });
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
