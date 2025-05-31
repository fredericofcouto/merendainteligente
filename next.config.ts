import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  basePath: '/merenda-inteligente',
  async redirects() {
    return [
      {
        source: '/merenda-inteligente',
        destination: '/merenda-inteligente/dashboard',
        basePath: false, // important: destination is already aware of basePath
        permanent: false,
      },
       {
        source: '/', // redirect from root to basePath
        destination: '/merenda-inteligente/dashboard',
        basePath: false,
        permanent: false,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'export', // Required for static export if not using server-side features extensively in App Router beyond Genkit.
                   // If more dynamic server-side rendering is needed later, this can be removed.
                   // For Genkit flows, this is fine.
};

export default nextConfig;
