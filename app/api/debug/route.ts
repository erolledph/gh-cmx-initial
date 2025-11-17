import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET() {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        HAS_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
        HAS_GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
        HAS_GITHUB_OWNER: !!process.env.GITHUB_OWNER,
        HAS_GITHUB_REPO: !!process.env.GITHUB_REPO,
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
