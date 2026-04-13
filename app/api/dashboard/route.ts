import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [
    totalRevenue,
    outstandingInvoices,
    totalClients,
    activeJobs,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { userId: user.id, status: 'paid' },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.count({
      where: { userId: user.id, status: 'unpaid' },
    }),
    prisma.client.count({
      where: { userId: user.id },
    }),
    prisma.job.count({
      where: { userId: user.id },
    }),
    prisma.invoice.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return NextResponse.json({
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    outstandingInvoices,
    totalClients,
    activeJobs,
    recentActivity: recentInvoices.map((inv: any) => ({
      id: inv.id,
      type: 'invoice',
      description: `Invoice ${inv.invoiceNumber} created for ${inv.client.name}`,
      amount: inv.totalAmount,
      date: inv.createdAt,
      status: inv.status,
    })),
  })
}
