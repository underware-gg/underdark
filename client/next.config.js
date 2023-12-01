
// const withTM = require('next-transpile-modules')(['somemodule', 'and-another']) // pass the modules you would like to see transpiled

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: process.env.SERVER_URL ?? '',
  },
  reactStrictMode: true,
  transpilePackages: [
    'react-ascii-text',
  ],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
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
}

export default nextConfig
