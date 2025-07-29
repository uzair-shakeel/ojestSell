const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Install webpack-bundle-analyzer if not already installed
try {
  require.resolve('@next/bundle-analyzer');
} catch (e) {
  console.log('Installing @next/bundle-analyzer...');
  execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' });
}

// Create next.config.bundle.js for analysis
const bundleConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Your existing config
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-select',
      'framer-motion'
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Bundle size optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          reactIcons: {
            test: /[\\/]node_modules[\\/]react-icons[\\/]/,
            name: 'react-icons',
            priority: 20,
            chunks: 'all',
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion', 
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
`;

// Write the bundle analyzer config
fs.writeFileSync(path.join(process.cwd(), 'next.config.bundle.js'), bundleConfig);

// Run the analysis
console.log('Building and analyzing bundle...');
execSync('ANALYZE=true npm run build', { 
  stdio: 'inherit',
  env: { ...process.env, NEXT_CONFIG_FILE: './next.config.bundle.js' }
});

// Clean up
fs.unlinkSync(path.join(process.cwd(), 'next.config.bundle.js'));

console.log('Bundle analysis complete! Check the opened browser tabs for detailed reports.');