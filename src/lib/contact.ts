import { z } from 'zod'

import {
  CONTACT_MAX_EMAIL_LENGTH,
  CONTACT_MAX_MESSAGE_LENGTH,
  CONTACT_MAX_NAME_LENGTH,
} from '@/lib/contact-config'

export const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_MAX_NAME_LENGTH),
  email: z.string().trim().min(1).max(CONTACT_MAX_EMAIL_LENGTH).email(),
  message: z.string().trim().min(1).max(CONTACT_MAX_MESSAGE_LENGTH),
  company: z.string().trim().max(0).optional().default(''),
  startedAt: z.number().int().nonnegative(),
})

export type ContactRequest = z.infer<typeof contactRequestSchema>
