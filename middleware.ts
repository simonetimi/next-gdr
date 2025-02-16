import { auth } from "@/auth";
import {
  CHARACTER_ROUTE,
  GAME_ROUTE,
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
} from "@/utils/routes";

// Define protected routes
const protectedRoutes = [GAME_ROUTE, CHARACTER_ROUTE];
const authRoutes = [LOGIN_ROUTE, SIGNUP_ROUTE];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  // anonym user accessing protected routes
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }

  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  // logged user accesing auth routes
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
