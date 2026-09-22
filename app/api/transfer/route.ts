import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { realDb } from '@/lib/db/real'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customerId = (session.user as { id: string }).id
  const { fromAccountId, toAccountId, amountCents, memo, recipientName } = await req.json()

  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // Verify fromAccount belongs to this customer
  const fromAccount = await realDb.account.findFirst({
    where: { id: fromAccountId, customerId },
  })
  if (!fromAccount) {
    return NextResponse.json({ error: 'Source account not found' }, { status: 404 })
  }

  if (fromAccount.balanceCents < amountCents) {
    return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
  }

  const isInternalTransfer = !!toAccountId

  // Use a transaction for atomicity
  await realDb.$transaction(async (tx) => {
    // Debit from source
    await tx.account.update({
      where: { id: fromAccountId },
      data: { balanceCents: { decrement: amountCents } },
    })
    await tx.transaction.create({
      data: {
        accountId: fromAccountId,
        amountCents,
        direction: 'debit',
        counterparty: isInternalTransfer ? 'Transfer to own account' : (recipientName ?? 'External Recipient'),
        memo: memo ?? null,
      },
    })

    if (isInternalTransfer) {
      // Credit to destination
      const toAccount = await tx.account.findFirst({
        where: { id: toAccountId, customerId },
      })
      if (!toAccount) throw new Error('Destination account not found')

      await tx.account.update({
        where: { id: toAccountId },
        data: { balanceCents: { increment: amountCents } },
      })
      await tx.transaction.create({
        data: {
          accountId: toAccountId,
          amountCents,
          direction: 'credit',
          counterparty: 'Transfer from own account',
          memo: memo ?? null,
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}
