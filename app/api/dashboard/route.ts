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
    outstandingInvoices,
    totalClients,
    activeJobs,
    recentInvoices,
    profile
  ] = await Promise.all([
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
    prisma.profile.findUnique({
      where: { id: user.id },
    })
  ])

  const roundToNearest = !!profile?.roundToNearest;

  return NextResponse.json({
    totalRevenue: 0, // Removed per request
    outstandingInvoices,
    totalClients,
    activeJobs,
    currency: profile?.currency || '$',
    recentActivity: recentInvoices.map((inv: any) => {
      let netTotal = inv.totalAmount * (1 - (inv.discount || 0) / 100) - (inv.discountAmount || 0);
      if (netTotal < 0) netTotal = 0;
      if (roundToNearest) netTotal = Math.round(netTotal);

      return {
        id: inv.id,
        type: 'invoice',
        description: `Invoice ${inv.invoiceNumber} created for ${inv.client.name}`,
        amount: netTotal,
        date: inv.createdAt,
        status: inv.status,
      };
    }),
  })
}
