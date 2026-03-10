import { auth } from '@/libs/auth'

export default auth

export const config = {
    matcher: ["/users/:path*"],
};
