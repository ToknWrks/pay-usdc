/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pino-pretty')
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['pino-pretty']
  }
}

module.exports = nextConfig
