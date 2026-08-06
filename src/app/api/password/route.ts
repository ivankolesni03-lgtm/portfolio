import { timingSafeEqual } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'

const PASSWORDS_ENV_NAME = 'PORTFOLIO_GATE_PASSWORDS'
const APPLICATION_PASSWORD = 'GME2027'

type PasswordAccess = 'default' | 'gme'

function parsePasswords(value: string) {
  return value
    .split(/[\r\n,;]+/)
    .map(password => password.trim())
    .filter(Boolean)
}

function readGatePasswords() {
  const multipleValues = process.env[PASSWORDS_ENV_NAME]

  if (multipleValues) {
    const passwords = parsePasswords(multipleValues)

    if (passwords.length > 0) {
      return passwords
    }
  }

  throw new Error(`Missing ${PASSWORDS_ENV_NAME} for the password gate route.`)
}

function passwordsMatch(submittedPassword: string, expectedPassword: string) {
  const submitted = Buffer.from(submittedPassword)
  const expected = Buffer.from(expectedPassword)

  if (submitted.length !== expected.length) {
    return false
  }

  return timingSafeEqual(submitted, expected)
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''

  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ success: false, code: 'unsupported_media_type' }, { status: 415 })
  }

  try {
    const body = await req.json()
    const password = typeof body?.password === 'string' ? body.password : ''
    const isApplicationPassword = password.trim().toUpperCase() === APPLICATION_PASSWORD

    if (isApplicationPassword) {
      return NextResponse.json({ success: true, access: 'gme' satisfies PasswordAccess }, {
        headers: {
          'Cache-Control': 'no-store',
        },
      })
    }

    const expectedPasswords = readGatePasswords()

    const isValid = expectedPasswords.some(expectedPassword => passwordsMatch(password, expectedPassword))

    if (!isValid) {
      return NextResponse.json({ success: false, code: 'invalid_password' }, { status: 401 })
    }

    return NextResponse.json({ success: true, access: 'default' satisfies PasswordAccess }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Password gate error:', error)
    return NextResponse.json({ success: false, code: 'server_error' }, { status: 500 })
  }
}
