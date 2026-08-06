import { timingSafeEqual } from 'node:crypto'

import { notFound } from 'next/navigation'
import Home from '@/app/page'

interface GmeSharePageProps {
  params: Promise<{ token: string }>
}

function tokensMatch(submittedToken: string, expectedToken: string) {
  const submitted = Buffer.from(submittedToken)
  const expected = Buffer.from(expectedToken)

  return submitted.length === expected.length && timingSafeEqual(submitted, expected)
}

export default async function GmeSharePage({ params }: GmeSharePageProps) {
  const { token } = await params
  const shareToken = process.env.GME_SHARE_TOKEN

  if (!shareToken || !tokensMatch(token, shareToken)) {
    notFound()
  }

  return <Home initialAccess="gme" bypassPasswordGate />
}