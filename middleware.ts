import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes — accessible without login
const isPublicRoute = createRouteMatcher([
  '/',                   // Landing page is public so visitors see the product
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/scan',           // Scan API checks auth client-side before calling
  '/api/results/(.*)',   // Scan results are shareable
  '/scan/(.*)',          // Scan results pages are shareable
  '/api/pixel(.*)',      // Pixel endpoint must be public (called from merchant sites)
  '/api/og/(.*)',        // OG images are public for social sharing
  '/api/webhooks/(.*)',  // Stripe webhooks must be public (no auth)
  '/pricing',            // Pricing page is public
  '/blog(.*)',           // Blog is public for SEO and AEO
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and public pages that don't need auth middleware
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
