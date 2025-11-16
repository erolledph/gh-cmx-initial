import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Auth POST request started`)

    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error(`[${requestId}] CRITICAL: ADMIN_PASSWORD not set`)
      return NextResponse.json({
        error: "Server misconfiguration",
        debug: { requestId, hasPassword: false }
      }, { status: 500 })
    }

    let password = ''
    
    try {
      const body = await request.json() as Record<string, unknown>
      password = String(body?.password || '').trim()
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse failed`)
      return NextResponse.json({ 
        error: "Invalid request body"
      }, { status: 400 })
    }

    if (!password) {
      console.warn(`[${requestId}] No password provided`)
      return NextResponse.json({ 
        error: "Password required"
      }, { status: 400 })
    }

    const isValid = password === adminPassword
    
    if (!isValid) {
      console.warn(`[${requestId}] Password mismatch`)
      return NextResponse.json({ 
        error: "Invalid password"
      }, { status: 401 })
    }

    console.log(`[${requestId}] Authentication successful ✓`)
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
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[${requestId}] Error:`, errorMsg)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}