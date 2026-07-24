import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, request) => {
  // Temporary: Disable authentication redirect
  // const { pathname } = request.nextUrl;
  // const isPublicRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  // if (!isPublicRoute) {
  //   await auth.protect();
  // }
});

export const config = {
  matcher: [
    // Protect all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico)).*)',
    // Run for API routes
    '/api/(.*)',
    '/__clerk/:path*',
  ],
};
