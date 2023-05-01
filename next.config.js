/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gentrydemchak-portfolio-content.s3.amazonaws.com',
        port: '',
        pathname: '/*',
      },
    ],
  },
}

module.exports = nextConfig
