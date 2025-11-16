import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set')
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    let password = ''
    try {
      const body = await request.json() as Record<string, unknown>
      password = body?.password as string
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}