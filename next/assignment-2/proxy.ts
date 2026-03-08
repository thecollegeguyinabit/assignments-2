import { NextResponse, NextRequest } from 'next/server'

export {auth as proxy} from "@/auth"

// This function can be marked `async` if using `await` inside
//   return NextResponse.redirect(new URL('/signin', request.url))
export default function proxy(request: NextRequest) {
}
 
export const config = {
//   matcher: '/',
}
