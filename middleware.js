import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/blog-main(.*)',
  '/blog(.*)',
  // Public course pages (shareable, indexable).
  '/c/(.*)',
  // Paystack calls this server-to-server; it authenticates by HMAC signature, not a session.
  // (Behind Clerk it returned 404, so purchases were never credited.)
  '/api/paystack-webhook',
  // Crawlers and AdSense must read these without signing in.
  '/robots.txt',
  '/sitemap.xml',
  '/ads.txt',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
