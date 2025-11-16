# Cloudflare Pages Deployment Guide

## Prerequisites
Your project is now configured for Next.js 15.5.2 which works with Cloudflare Pages.

## Cloudflare Pages Configuration

### Build Settings
When setting up your Cloudflare Pages project, use these settings:

- **Framework preset**: Next.js
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`

### Environment Variables
You MUST configure these environment variables in Cloudflare Pages dashboard:

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
GITHUB_OWNER=erolledph
GITHUB_REPO=gh-cmx-initial
GITHUB_TOKEN=you-token
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
```

**IMPORTANT**: Set these for both Production and Preview environments.

## Issues Fixed

1. ✅ Upgraded Next.js from 13.5.1 to 15.5.2
2. ✅ Fixed React Date object rendering error
3. ✅ Configured proper Cloudflare Pages adapter
4. ✅ Fixed async params for Next.js 15
5. ✅ Environment variables now loaded at runtime

## Local Testing

To test the Cloudflare build locally:
```bash
npm run pages:build
npm run preview
```

## Notes

- Environment variables are loaded at runtime, not build time
- The GitHub API calls will work once environment variables are set in Cloudflare
- Make sure to redeploy after setting environment variables
