/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true,
  output: 'export',
  // Add a custom build ID for consistent deployments
  generateBuildId: async () => {
    // You could use git hash or timestamp for versioning
    return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  },
  // Images must be handled differently in static exports
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
