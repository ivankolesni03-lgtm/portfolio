import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

import { contactRequestSchema } from '@/lib/contact'
import {
  CONTACT_MAX_REQUEST_BYTES,
  CONTACT_MAX_SUBMISSION_AGE_MS,
  CONTACT_MIN_SUBMISSION_TIME_MS,
  CONTACT_RATE_LIMIT_MAX_REQUESTS,
  CONTACT_RATE_LIMIT_WINDOW_MS,
} from '@/lib/contact-config'

const textEncoder = new TextEncoder()

function readRequiredEnv(name: 'RESEND_API_KEY' | 'CONTACT_EMAIL_FROM' | 'CONTACT_EMAIL_TO' | 'CONTACT_EMAIL_SUBJECT_PREFIX') {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing ${name} for the contact mail route.`)
  }

  return value
}

function extractEmailAddress(value: string) {
  const formattedMatch = value.match(/<([^<>]+)>$/)

  return (formattedMatch ? formattedMatch[1] : value).trim()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const contactMailConfig = (() => {
  const resendApiKey = readRequiredEnv('RESEND_API_KEY')
  const from = readRequiredEnv('CONTACT_EMAIL_FROM')
  const to = readRequiredEnv('CONTACT_EMAIL_TO')
  const subjectPrefix = readRequiredEnv('CONTACT_EMAIL_SUBJECT_PREFIX')

  if (!isValidEmail(extractEmailAddress(from))) {
    throw new Error('CONTACT_EMAIL_FROM must be a valid sender email or the format "Name <email@example.com>".')
  }

  if (!isValidEmail(to)) {
    throw new Error('CONTACT_EMAIL_TO must be a valid recipient email address.')
  }

  return {
    resendApiKey,
    from,
    to,
    subjectPrefix,
  }
})()

const resend = new Resend(contactMailConfig.resendApiKey)

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function jsonError(
  status: number,
  code: string,
  details?: Record<string, unknown>
) {
  return NextResponse.json({ success: false, code, ...details }, { status })
}

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp?.trim() || 'unknown'

  return `contact:${ip}`
}

function consumeRateLimit(key: string, now: number) {
  for (const [storedKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(storedKey)
    }
  }

  const existing = rateLimitStore.get(key)
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (existing.count >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: existing.resetAt - now }
  }

  existing.count += 1
  rateLimitStore.set(key, existing)
  return { allowed: true }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonError(415, 'unsupported_media_type')
  }

  const declaredLength = Number(req.headers.get('content-length') || '0')
  if (Number.isFinite(declaredLength) && declaredLength > CONTACT_MAX_REQUEST_BYTES) {
    return jsonError(413, 'payload_too_large')
  }

  try {
    const rawBody = await req.text()

    if (textEncoder.encode(rawBody).length > CONTACT_MAX_REQUEST_BYTES) {
      return jsonError(413, 'payload_too_large')
    }

    let parsedBody: unknown
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      return jsonError(400, 'invalid_json')
    }

    const rateLimitResult = consumeRateLimit(getClientKey(req), Date.now())
    if (!rateLimitResult.allowed) {
      return jsonError(429, 'rate_limited', {
        retryAfterMs: rateLimitResult.retryAfterMs,
      })
    }

    const result = contactRequestSchema.safeParse(parsedBody)
    if (!result.success) {
      return jsonError(400, 'validation_error', {
        fieldErrors: result.error.flatten().fieldErrors,
      })
    }

    const { name, email, message, company, startedAt } = result.data

    if (company) {
      return jsonError(400, 'bot_detected')
    }

    const elapsed = Date.now() - startedAt
    if (elapsed < CONTACT_MIN_SUBMISSION_TIME_MS || elapsed > CONTACT_MAX_SUBMISSION_AGE_MS) {
      return jsonError(400, 'bot_detected')
    }

    const { error } = await resend.emails.send({
      from: contactMailConfig.from,
      to: contactMailConfig.to,
      replyTo: email,
      subject: `${contactMailConfig.subjectPrefix}: Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    })

    if (error) {
      console.error('Resend error:', error)
      return jsonError(502, 'email_send_failed')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    return jsonError(500, 'server_error')
  }
}
