import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD

    // If no password is configured, return 500 with clear message
    if (!adminPassword) {
      console.error('CRITICAL: ADMIN_PASSWORD environment variable is not set in Cloudflare')
      return NextResponse.json({
        error: "Authentication service not configured",
        hint: "ADMIN_PASSWORD environment variable is missing. Set it in Cloudflare Pages Settings > Environment Variables."
      }, { status: 500 })
    }

    let password = ''
    try {
      const body = await request.json() as { password?: string }
      password = body?.password || ''
    } catch (e) {
      return NextResponse.json({ 
        error: "Invalid request format" 
      }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password is required" 
      }, { status: 400 })
    }

    // Compare with trimming
    const passwordMatch = password.trim() === adminPassword.trim()

    if (!passwordMatch) {
      return NextResponse.json({ 
        error: "Invalid credentials" 
      }, { status: 401 })
    }

    // Success
    const response = NextResponse.json({ 
      success: true,
      message: "Authentication successful"
    })
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    })
    return response

  } catch (error) {
    console.error('Auth endpoint error:', error)
    return NextResponse.json({
      error: "Authentication service error"
    }, { status: 500 })
  }
}