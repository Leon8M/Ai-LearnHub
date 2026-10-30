import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the project root (a stray lockfile in a parent folder confuses file tracing).
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  images: {
    // `domains` is deprecated; remotePatterns also pins the protocol.
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  transpilePackages: ['next-mdx-remote'],
};

export default nextConfig;
