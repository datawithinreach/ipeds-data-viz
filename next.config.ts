import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx'],
  output: 'export', // Enables static export
  basePath: '/ipeds-data-viz', // Replace with your GitHub repository name
  images: {
    unoptimized: true, // Required because Next.js Image Optimization needs a server
  },
};
const withMDX = createMDX({});

export default withMDX(nextConfig);
