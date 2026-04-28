/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Esto ayuda a que el build sea más ligero y no intente conexiones raras
  output: 'standalone', 
};

export default nextConfig;