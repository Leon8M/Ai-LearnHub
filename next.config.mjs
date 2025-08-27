/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com', 'res.cloudinary.com'],
    },
    transpilePackages: ['next-mdx-remote'],
};

export default nextConfig;
