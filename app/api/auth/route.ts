import { NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type')
    let body: Record<string, string> = {}
    
    if (contentType?.includes('application/json')) {
      body = await request.json()
    }
    
    const password = body?.password

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    if (!checkAuth(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}