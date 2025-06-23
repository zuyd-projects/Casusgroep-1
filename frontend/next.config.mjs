/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    // Determine backend URL based on environment
    const backendUrl = process.env.BACKEND_URL ||
      (process.env.NODE_ENV === 'production' ?
        'http://localhost:8080' :
        'http://localhost:5045');

    console.log(`[Next.js] Proxying API requests to: ${backendUrl}`);

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
      {
        source: '/simulationHub/:path*',
        destination: `${backendUrl}/simulationHub/:path*`, // Proxy SignalR hub
      },
    ];
  },
  // Enable WebSocket support for SignalR
  experimental: {
    proxyTimeout: 600000, // 10 minutes timeout for long polling
  },
};

export default nextConfig;
