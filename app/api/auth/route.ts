import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // @ts-ignore - Cloudflare Pages environment
    const env = process.env as any
    const adminPassword = env.ADMIN_PASSWORD

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

    const trimmedAdminPassword = String(adminPassword).trim()

    if (password !== trimmedAdminPassword) {
      return NextResponse.json({
        error: "Invalid password"
      }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true
    })

    // Cloudflare Pages compatible cookie settings
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
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}