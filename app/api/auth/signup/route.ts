import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { realDb } from '@/lib/db/real'
import { z } from 'zod'

const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, password } = signupSchema.parse(body)

    const existing = await realDb.customer.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const customer = await realDb.customer.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        accounts: {
          create: [
            { type: 'checking', balanceCents: 250000 }, // $2,500 starting balance
            { type: 'savings', balanceCents: 1000000 }, // $10,000 starting savings
          ],
        },
      },
    })

    return NextResponse.json({ customerId: customer.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).errors[0].message }, { status: 400 })
    }
    console.error('[signup]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
