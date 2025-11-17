import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json({
        error: "ADMIN_PASSWORD not configured",
      }, { status: 500 })
    }

    let password = ''
    try {
      const body = await request.json() as { password?: string }
      password = String(body?.password || '').trim()
    } catch (e) {
      return NextResponse.json({ 
        error: "Invalid JSON in request body" 
      }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password required" 
      }, { status: 400 })
    }

    if (password !== adminPassword.trim()) {
      return NextResponse.json({ 
        error: "Invalid password" 
      }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true
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
    console.error('Auth error:', error)
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 })
  }
}