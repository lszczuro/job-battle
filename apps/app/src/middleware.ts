import { NextResponse } from "next/server";

export function middleware() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/dev/:path*",
};
