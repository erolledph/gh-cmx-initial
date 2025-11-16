import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET() {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        HAS_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
        ADMIN_PASSWORD_VALUE: process.env.ADMIN_PASSWORD || 'NOT SET',
        HAS_GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
        GITHUB_TOKEN_VALUE: process.env.GITHUB_TOKEN ? 'SET' : 'NOT SET',
        HAS_GITHUB_OWNER: !!process.env.GITHUB_OWNER,
        GITHUB_OWNER_VALUE: process.env.GITHUB_OWNER || 'NOT SET',
        HAS_GITHUB_REPO: !!process.env.GITHUB_REPO,
        GITHUB_REPO_VALUE: process.env.GITHUB_REPO || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      }
    }
    
    return NextResponse.json(debug)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 })
  }
}
