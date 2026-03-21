export const CONTACT_MAX_NAME_LENGTH = 120
export const CONTACT_MAX_EMAIL_LENGTH = 254
export const CONTACT_MAX_MESSAGE_LENGTH = 4000
export const CONTACT_MAX_REQUEST_BYTES = 8 * 1024
export const CONTACT_MIN_SUBMISSION_TIME_MS = 1500
export const CONTACT_MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 24
export const CONTACT_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15
export const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5

export type ContactFormPayload = {
  name: string
  email: string
  message: string
  company: string
  startedAt: number
}

export const CONTACT_API_ERROR_CODES = [
  'invalid_json',
  'unsupported_media_type',
  'payload_too_large',
  'validation_error',
  'rate_limited',
  'bot_detected',
  'email_send_failed',
  'server_error',
] as const

export type ContactApiErrorCode = (typeof CONTACT_API_ERROR_CODES)[number]

export function isContactApiErrorCode(value: unknown): value is ContactApiErrorCode {
  return typeof value === 'string' && CONTACT_API_ERROR_CODES.includes(value as ContactApiErrorCode)
}
