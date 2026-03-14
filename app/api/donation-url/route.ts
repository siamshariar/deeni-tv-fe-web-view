import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const BD_URL = 'https://www.deeniinfotech.com/donate/bd#payment-information'
const DEFAULT_URL = 'https://www.deeniinfotech.com/donate#donation-form'

export async function GET(request: NextRequest) {
  // Vercel injects the visitor's ISO 3166-1 alpha-2 country code into this header.
  // Falls back gracefully when running locally (header absent → default URL).
  const vercelCountry = request.headers.get('x-vercel-ip-country') ?? ''
  console.log('donation-url x-vercel-ip-country:', vercelCountry)

  // ── Local testing override ──────────────────────────────────────────────────
  // ?country=BD  → Bangladesh URL
  // ?country=US  → Default URL
  // Only honoured in development so it can never be abused in production.
  const isDev = process.env.NODE_ENV === 'development'
  const queryCountry = isDev
    ? (request.nextUrl.searchParams.get('country') ?? '')
    : ''

  const country = (queryCountry || vercelCountry).toUpperCase()

  const url = country === 'BD' ? BD_URL : DEFAULT_URL

  return NextResponse.json({ url }, {
    headers: {
      // Cache for 1 hour on the CDN edge; revalidate in background.
      // Country detection is per-request on Vercel so edge caching is safe here.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
