// app/api/contact/route.ts
// Installiere zuerst: npm install resend

import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',   // ← später durch deine Domain ersetzen
      to:   'ivan.kolesni03@gmail.com',             // ← deine E-Mail
      replyTo: email,
      subject: `Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}