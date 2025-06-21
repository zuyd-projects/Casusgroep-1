/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};

export default nextConfig;
