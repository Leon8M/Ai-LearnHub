// lib/seo.js

import { Metadata } from 'next';

export function generateBlogMetadata(frontmatter, slug) {
  const baseUrl = 'https://kamusi.denexsoftware.co.ke'; // ✅ Your domain
  const postUrl = `${baseUrl}/blog/${slug}`;
  const imageUrl = frontmatter.image ? `${baseUrl}${frontmatter.image}` : `${baseUrl}/og-image.png`;

  const metadata = {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.tags ? frontmatter.tags.join(', ') : '',
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: postUrl,
      type: 'article', // Important for blog posts
      authors: [frontmatter.author || 'Kamusi AI'],
      publishedTime: frontmatter.date,
      images: [{
        url: imageUrl,
        width: 1200, // Standard Open Graph image width
        height: 630, // Standard Open Graph image height
        alt: frontmatter.title,
      }],
      siteName: 'Kamusi AI',
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: [imageUrl],
      creator: '@YourTwitterHandle', // ✅ Your Twitter handle
    },
    alternates: {
      canonical: postUrl,
    },
  };

  return metadata;
}