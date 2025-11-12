import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/create-account",
  "/reset-password",
  "/confirm-account",
];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session_data")?.value;
  const pathname = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && isPublicRoute) {
    if (pathname.startsWith("/confirm-account")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
