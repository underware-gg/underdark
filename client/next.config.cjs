/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: process.env.SERVER_URL,
  },
  reactStrictMode: true,
  transpilePackages: [
    'react-ascii-text',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
        "supports-color": "supports-color"
      });
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/limbo',
        destination: '/',
        permanent: false,
      },
    ]
  },
};

module.exports = nextConfig;
