/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Esto evita que intente renderizar páginas que requieren DB en el build
  output: 'standalone', 
};

export default nextConfig;