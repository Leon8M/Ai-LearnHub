// app/blog/[slug]/page.jsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // npm install gray-matter
import { MDXRemote } from 'next-mdx-remote/rsc'; // npm install next-mdx-remote
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { customComponents } from '@/components/mdx-components'; // Create this file (Step 6)
import { generateBlogMetadata } from '@/lib/seo'; // Create this file (Step 7)
import { ChevronLeft } from 'lucide-react'; // Example icon for back button
import Image from 'next/image';
import { cn } from '@/lib/utils';

// --- Function to get all blog post slugs ---
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  const filenames = fs.readdirSync(postsDirectory);
  return filenames.map(filename => ({
    slug: filename.replace(/\.(mdx?)$/, ''),
  }));
}

// --- Function to read and parse the MDX file ---
async function getPost(slug) {
  try {
    const postsDirectory = path.join(process.cwd(), 'content/blog');
    const fullPath = path.join(postsDirectory, `${slug}.mdx`); // Supports .mdx and .md
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    return { data, content };
  } catch (error) {
    console.error(`Failed to load blog post: ${slug}`, error);
    notFound(); // Next.js utility to show 404 page
  }
}

// --- Generate dynamic metadata for each blog post ---
export async function generateMetadata({ params }) {
  const { data } = await getPost(params.slug);
  return generateBlogMetadata(data, params.slug); // Using a helper function for consistent SEO
}


export default async function BlogPostPage({ params }) {
  const { data, content } = await getPost(params.slug);

  // --- Extract headings for Table of Contents ---
  const headings = content.match(/^(#+)\s(.+)$/gm)?.map(heading => {
    const level = heading.match(/^#+/)[0].length;
    const text = heading.replace(/^#+\s/, '');
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''); // Generate slug-like ID
    return { level, text, id };
  }).filter(h => h.level === 2 || h.level === 3); // Only include H2 and H3

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/blog-main" className="inline-flex items-center text-primary hover:underline mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Blog
      </Link>

      <article className="prose dark:prose-invert max-w-none">
        {/* Blog Post Header */}
        <h1 className="text-4xl font-bold mb-2">{data.title}</h1>
        <p className="text-gray-500 mb-4">{data.date} by {data.author}</p>
        {data.image && (
          <Image src={data.image} alt={data.title} width={800} height={400} className="rounded-lg mb-6" />
        )}
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{data.description}</p>

        <hr className="my-8" />

        {/* Table of Contents (if any H2/H3 headings exist) */}
        {headings && headings.length > 0 && (
          <aside className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3">Table of Contents</h3>
            <nav>
              <ul className="list-none p-0 m-0">
                {headings.map(h => (
                  <li key={h.id} className={cn(h.level === 3 && 'ml-4')}>
                    <Link href={`#${h.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                      {h.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        {/* MDX Content Rendering */}
        <MDXRemote source={content} components={customComponents} />
      </article>
    </div>
  );
}