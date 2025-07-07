// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/products(.*)',
  '/api/product-details(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // ✅ `auth` is already provided
  if (!isPublicRoute(req)) {
    await auth.protect(); // ✅ use it directly
  }
});

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:.*)).*)',
    '/(api|trpc)(.*)',
  ],
};
