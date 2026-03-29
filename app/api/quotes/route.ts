import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId, totalAmount, jobIds } = await req.json()

  // Generate quote number Q-0001 format
  const quoteCount = await prisma.quote.count({
    where: { userId: user.id }
  })
  const quoteNumber = `Q-${(quoteCount + 1).toString().padStart(4, '0')}`

  const quote = await prisma.quote.create({
    data: {
      userId: user.id,
      clientId,
      quoteNumber,
      totalAmount: parseFloat(totalAmount),
      jobs: {
        connect: jobIds.map((id: string) => ({ id }))
      }
    },
  })

  return NextResponse.json(quote)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quotes = await prisma.quote.findMany({
    where: { userId: user.id },
    include: { client: true, jobs: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(quotes)
}
