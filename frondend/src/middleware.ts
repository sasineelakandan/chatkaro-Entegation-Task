import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";


const USER_ROUTES = new Set(["/home"]);
const PUBLIC_ROUTES = new Set(["/", "/signup"]);
const UNPROTECTED_ROUTES = new Set(["/_next/", "/favicon.ico", "/api/"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  
  if (
    [...UNPROTECTED_ROUTES].some(route => pathname.startsWith(route)) ||
    PUBLIC_ROUTES.has(pathname)
  ) {
    console.log(` Public/Unprotected Route Access: ${pathname}`);
    return NextResponse.next();
  }

  // Verify token for protected routes
  const tokenData = await verifyToken("refreshToken", req);
  const role = tokenData?.role;

  // If not authenticated, redirect to login or root
  if (!role) {
    console.log(`No valid token. Redirecting ${pathname} to /`);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Role-based protection for 'user'
  if (role === "user" && !USER_ROUTES.has(pathname)) {
    console.log(`🔒 Unauthorized user access to ${pathname}. Redirecting to /home`);
    return NextResponse.redirect(new URL("/home", req.url));
  }

  console.log(` Access granted to ${pathname} for role: ${role}`);
  return NextResponse.next();
}

// Helper: Verifies JWT token from cookies
async function verifyToken(tokenName: string, req: NextRequest): Promise<{ role: string | null }> {
  let token: string | null = null;

  // 1. Try to get from cookie
  const cookieToken = req.cookies.get(tokenName)?.value;

  // 2. Try to get from Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback to cookie token if no Bearer token
  if (!token && cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    console.error("Token not found in cookies or Authorization header");
    return { role: null };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined");
    return { role: null };
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = payload?.role as string | undefined;

    if (!role) {
      console.error("Role not found in token payload");
      return { role: null };
    }

    console.log(`🔐 Token verified. Role: ${role}`);
    return { role };
  } catch (err: any) {
    console.error(`Token verification failed: ${err.message}`);
    return { role: null };
  }
}
