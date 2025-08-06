/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.open-meteo.com'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Weather Dashboard',
    NEXT_PUBLIC_API_BASE_URL: 'https://archive-api.open-meteo.com/v1',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
}

module.exports = nextConfig