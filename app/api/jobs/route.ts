import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(jobs)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId, date, eventName, medics, hours, hourlyRate } = await req.json()

  const totalCost = medics * hours * hourlyRate

  const job = await prisma.job.create({
    data: {
      userId: user.id,
      clientId,
      date: new Date(date),
      eventName,
      medics: parseInt(medics),
      hours: parseFloat(hours),
      hourlyRate: parseFloat(hourlyRate),
      totalCost,
    },
  })

  return NextResponse.json(job)
}
