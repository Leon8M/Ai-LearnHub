import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import Image from "next/image"; 
import fs from "fs";
import path from "path";
import matter from "gray-matter";

async function getAllBlogPosts() {
  const postsDirectory = path.join(process.cwd(), "content/blog");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const slug = filename.replace(/\.(mdx?)$/, "");
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    return {
      slug,
      ...data,
      date: new Date(data.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return posts;
}

export default async function BlogListPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 h-full">
          <Link href="/">
            <div className="relative flex items-center">
              <Image 
                src="/logo-main.png" 
                alt="Kamusi AI Logo - AI powered course generator"
                width={120}
                height={40}
                className="h-10 sm:h-14 w-auto relative z-10 transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 z-0 blur-[50px] rounded-full bg-[oklch(0.75_0.2_280/_0.25)]" />
            </div>
          </Link>
          <Link href="/" passHref>
            <Button variant="ghost" className="text-sm font-medium h-auto flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-foreground mb-4">
            Kamusi AI Blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Insights on AI, learning, and technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {posts.map((post) => (
            <Card 
              key={post.slug} 
              className="p-6 rounded-2xl shadow-sm hover:shadow-lg transition duration-300 hover:-translate-y-1"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {post.image && (
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    width={600} 
                    height={300} 
                    className="rounded-xl mb-4 object-cover w-full aspect-video" 
                  />
                )}
                <h2 className="text-2xl font-bold mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {post.date} by{" "}
                  <span className="text-foreground font-medium">{post.author}</span>
                </p>
                <p className="text-muted-foreground mb-4">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags && post.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-accent text-secondary text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 md:py-8 border-t border-border text-center text-muted-foreground text-xs sm:text-sm mt-auto"> 
        <div className="container mx-auto px-4 sm:px-6"> 
          &copy; {new Date().getFullYear()} Kamusi. Built for the endlessly curious.
        </div>
      </footer>
    </div>
  );
}
