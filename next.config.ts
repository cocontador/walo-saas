import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type checking queda separado en `npm run typecheck`
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
}

export default nextConfig
