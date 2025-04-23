import { NextRequest, NextResponse } from 'next/server';
import { User } from './app/hooks/useUser';
import { jwtDecode } from 'jwt-decode';


export function middleware(req: NextRequest) {


    // Get the access token from cookies
    const token = req.cookies.get('access_token')?.value;
    const url = req.nextUrl;
    // If no token, redirect to login
    if (!token) {
        const url = new URL("/",req.nextUrl.origin);
        url.searchParams.set('toast', 'You are not logged in');
        return NextResponse.redirect(url);
    }

    const decodedUser = jwtDecode<User>(token);
    if(decodedUser.role === 'admin') {
        if(url.pathname.startsWith('/students') || url.pathname.startsWith('/alumni')) {
            const url = new URL("/",req.nextUrl.origin);
            url.searchParams.set('toast', 'You are logged in as admin');
            return NextResponse.redirect(url);
        }
    }
    else if(decodedUser.role === 'faculty') {
        if(url.pathname.startsWith('/admin') || url.pathname.startsWith('/students') || url.pathname.startsWith('/alumni')) {
            const url = new URL("/",req.nextUrl.origin);
            url.searchParams.set('toast', 'You are logged in as faculty');
            return NextResponse.redirect(url);
        }
    }
    else if(decodedUser.role === 'student') {
        if(url.pathname.startsWith('/admin') || url.pathname.startsWith('/faculty') || url.pathname.startsWith('/alumni')) {
            const url = new URL("/",req.nextUrl.origin);
            url.searchParams.set('toast', 'You are logged in as student');
            return NextResponse.redirect(url);
        }
    }
    else if(decodedUser.role === 'alumni') {
        if(url.pathname.startsWith('/admin') || url.pathname.startsWith('/faculty') || url.pathname.startsWith('/students')) {
            const url = new URL("/",req.nextUrl.origin);
            url.searchParams.set('toast', 'You are logged in as alumni');
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// Define which routes to protect
export const config = {
    matcher: [
        /*
         * Match all paths except:
         * 1. / (home page)
         * 2. /_next (Next.js internals)
         * 3. /api (API routes)
         */
        '/((?!api|_next|$).*)',
    ],
};








