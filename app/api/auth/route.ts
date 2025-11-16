import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Get password from environment - available at runtime
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({
        error: "Server error: password not configured"
      }, { status: 500 })
    }

    // Parse request body
    let password = ''
    try {
      const body = await request.json() as { password?: string }
      password = body?.password || ''
    } catch {
      return NextResponse.json({ 
        error: "Invalid request" 
      }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password required" 
      }, { status: 400 })
    }

    // Compare passwords
    if (password.trim() !== adminPassword.trim()) {
      return NextResponse.json({ 
        error: "Invalid password" 
      }, { status: 401 })
    }

    // Success - set auth cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({
      error: "Server error"
    }, { status: 500 })
  }
}