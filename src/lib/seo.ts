const LOCALHOST_FALLBACK = 'http://localhost:3000'

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!raw) return LOCALHOST_FALLBACK

  try {
    return new URL(raw).toString().replace(/\/$/, '')
  } catch {
    return LOCALHOST_FALLBACK
  }
}
