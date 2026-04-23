import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const repo = 'ipeds-data-viz';
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? `/${repo}` : '';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx'],
  output: 'export', // Enables static export
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true, // Required because Next.js Image Optimization needs a server
  },
};
const withMDX = createMDX({});

export default withMDX(nextConfig);
