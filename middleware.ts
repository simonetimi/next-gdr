import authConfig from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

// Define protected routes
const protectedRoutes = ["/game"];
const authRoutes = ["/login", "/signup"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
