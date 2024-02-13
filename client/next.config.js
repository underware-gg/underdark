
// const withTM = require('next-transpile-modules')(['somemodule', 'and-another']) // pass the modules you would like to see transpiled

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: process.env.SERVER_URL ?? '',
    PROOF_LOST_GAMES: parseInt(process.env.NEXT_PUBLIC_PROOF_LOST_GAMES ?? 0) == 1,
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
    config.experiments = { asyncWebAssembly: true }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/gate',
        destination: '/underdark/gate',
      },
      {
        source: '/manor',
        destination: '/underdark/manor',
      },
      {
        source: '/room/:slug*',
        destination: '/underdark/room/:slug*',
      },
    ]
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/limbo',
  //       destination: '/',
  //       permanent: false,
  //     },
  //   ]
  // },
}

export default nextConfig
