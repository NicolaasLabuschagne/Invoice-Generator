import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId, totalAmount, status } = await req.json()

  // Generate invoice number INV-0001 format
  const invoiceCount = await prisma.invoice.count({
    where: { userId: user.id }
  })
  const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(4, '0')}`

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId,
      invoiceNumber,
      totalAmount: parseFloat(totalAmount),
      status: status || 'unpaid',
    },
  })

  return NextResponse.json(invoice)
}
