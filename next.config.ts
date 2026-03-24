import type { NextConfig } from 'next';

const repoName = 'easykanji';
const basePath = process.env.NODE_ENV === 'production' ? `/${repoName}` : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  allowedDevOrigins: ['192.168.1.222'],
};

export default nextConfig;
