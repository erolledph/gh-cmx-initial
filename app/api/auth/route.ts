import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Auth POST request started`)

    // Get all environment variables for debugging
    const adminPassword = process.env.ADMIN_PASSWORD
    const allEnv = {
      HAS_PASSWORD: !!adminPassword,
      PASSWORD_LENGTH: adminPassword?.length || 0,
      PASSWORD_TYPE: typeof adminPassword,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    console.log(`[${requestId}] Environment check:`, JSON.stringify(allEnv))

    if (!adminPassword) {
      console.error(`[${requestId}] CRITICAL: ADMIN_PASSWORD not set`)
      const response = NextResponse.json({
        error: "ADMIN_PASSWORD not configured in environment",
        debug: { requestId, env: allEnv }
      }, { status: 500 })
      return response
    }

    let password = ''
    let body: Record<string, unknown> = {}
    
    try {
      body = await request.json() as Record<string, unknown>
      password = String(body?.password || '').trim()
      console.log(`[${requestId}] Request body parsed, password length: ${password.length}`)
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse failed:`, parseError)
      return NextResponse.json({ 
        error: "Invalid request body",
        debug: { requestId }
      }, { status: 400 })
    }

    if (!password) {
      console.warn(`[${requestId}] No password in request`)
      return NextResponse.json({ 
        error: "Password required",
        debug: { requestId }
      }, { status: 400 })
    }

    const normalizedProvided = password.trim().toLowerCase()
    const normalizedExpected = String(adminPassword).trim().toLowerCase()
    
    const isValid = normalizedProvided === normalizedExpected
    
    console.log(`[${requestId}] Password check:`, {
      match: isValid,
      providedLen: password.length,
      expectedLen: adminPassword.length,
      normalizedMatch: normalizedProvided === normalizedExpected
    })

    if (!isValid) {
      console.warn(`[${requestId}] Password mismatch`)
      return NextResponse.json({ 
        error: "Invalid password",
        debug: { 
          requestId,
          match: false,
          providedLength: password.length,
          expectedLength: adminPassword.length
        }
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
    console.error(`[${requestId}] Unhandled error:`, errorMsg)
    return NextResponse.json(
      { 
        error: "Internal server error",
        debug: { requestId, message: errorMsg }
      },
      { status: 500 }
    )
  }
}