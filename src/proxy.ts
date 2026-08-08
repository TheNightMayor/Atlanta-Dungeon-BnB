import { NextResponse } from 'next/server';

export function proxy(request: Request) {
    return NextResponse.next();
}

export default proxy;

export const config = {
    matcher: ["/users/:path*"],
};
