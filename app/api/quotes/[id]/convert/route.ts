import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const quote = await prisma.quote.findFirst({
    where: { id: id, userId: user.id },
    include: { jobs: true }
  })

  if (!quote) {
    return NextResponse.json({ error: 'Quote Not Found' }, { status: 404 })
  }

  // Generate invoice number INV-0001 format
  const invoiceCount = await prisma.invoice.count({
    where: { userId: user.id }
  })
  const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(4, '0')}`

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: quote.clientId,
      invoiceNumber,
      totalAmount: quote.totalAmount,
      status: 'unpaid',
      jobs: {
        connect: quote.jobs.map(job => ({ id: job.id }))
      }
    },
  })

  return NextResponse.json(invoice)
}
