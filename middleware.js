import { NextResponse } from 'next/server';

export default function middleware(request) {
  // During build or in production, do nothing
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.next();
  }
  
  // In development, you could add Clerk functionality here
  // But for now, just pass through all requests
  return NextResponse.next();
}

export const config = {
  // Only match routes that should be protected
  matcher: ['/dashboard/:path*'],
};
