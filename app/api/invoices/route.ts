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

  const { clientId, totalAmount, discount, discountAmount, status, jobIds } = await req.json()

  let finalClientId = clientId
  let finalTotalAmount = totalAmount

  // If only jobIds are provided, fetch them to calculate total and get clientId
  if (jobIds && jobIds.length > 0 && (!clientId || !totalAmount)) {
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds }, userId: user.id }
    })
    if (jobs.length > 0) {
      finalClientId = jobs[0].clientId
      finalTotalAmount = jobs.reduce((sum, job) => sum + job.totalCost, 0)
    }
  }

  // Generate invoice number INV-0001 format
  const invoiceCount = await prisma.invoice.count({
    where: { userId: user.id }
  })
  const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(4, '0')}`

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: finalClientId,
      invoiceNumber,
      totalAmount: parseFloat(finalTotalAmount),
      discount: parseFloat(discount || 0),
      discountAmount: parseFloat(discountAmount || 0),
      status: status || 'unpaid',
      jobs: jobIds ? {
        connect: jobIds.map((id: string) => ({ id }))
      } : undefined
    },
  })

  return NextResponse.json(invoice)
}
