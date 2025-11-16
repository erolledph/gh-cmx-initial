import { NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    env: {
      HAS_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      ADMIN_PASSWORD_LENGTH: process.env.ADMIN_PASSWORD?.length || 0,
      HAS_GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      HAS_GITHUB_OWNER: !!process.env.GITHUB_OWNER,
      HAS_GITHUB_REPO: !!process.env.GITHUB_REPO,
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString()
  })
}
