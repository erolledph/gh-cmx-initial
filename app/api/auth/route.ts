import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Auth POST request started`)

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error(`[${requestId}] CRITICAL: ADMIN_PASSWORD environment variable is not set`)
      return NextResponse.json(
        { error: "Server misconfiguration - no admin password" },
        { status: 500 }
      )
    }
    console.log(`[${requestId}] Admin password is set, length: ${adminPassword.length}, first char code: ${adminPassword.charCodeAt(0)}`)

    let password = ''
    try {
      const body = await request.json() as Record<string, unknown>
      password = body?.password as string
      console.log(`[${requestId}] JSON parsed successfully, password length: ${password?.length || 0}, first char code: ${password?.charCodeAt(0) || 'N/A'}`)
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError instanceof Error ? parseError.message : parseError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (!password) {
      console.warn(`[${requestId}] Password not provided in request body`)
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    // Trim and normalize both passwords
    const normalizedProvided = String(password).trim()
    const normalizedExpected = String(adminPassword).trim()
    
    console.log(`[${requestId}] Before normalization - provided: "${password}" (${password.length}), expected: "${adminPassword}" (${adminPassword.length})`)
    console.log(`[${requestId}] After normalization - provided: "${normalizedProvided}" (${normalizedProvided.length}), expected: "${normalizedExpected}" (${normalizedExpected.length})`)

    const isValid = normalizedProvided === normalizedExpected
    console.log(`[${requestId}] Password validation: ${isValid ? 'VALID ✓' : 'INVALID ✗'}`)

    if (!isValid) {
      console.warn(`[${requestId}] Authentication failed - passwords do not match`)
      console.warn(`[${requestId}] Provided bytes: ${Array.from(normalizedProvided).map(c => c.charCodeAt(0)).join(',')}`)
      console.warn(`[${requestId}] Expected bytes: ${Array.from(normalizedExpected).map(c => c.charCodeAt(0)).join(',')}`)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    console.log(`[${requestId}] Authentication successful`)
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    console.log(`[${requestId}] Response sent with auth cookie (${Date.now() - startTime}ms)`)
    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : 'no stack'
    console.error(`[${requestId}] INTERNAL ERROR: ${errorMsg}`)
    console.error(`[${requestId}] Stack trace: ${errorStack}`)
    console.error(`[${requestId}] Request took ${Date.now() - startTime}ms before error`)
    return NextResponse.json(
      { error: "Login failed", requestId },
      { status: 500 }
    )
  }
}