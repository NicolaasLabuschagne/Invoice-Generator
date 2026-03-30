import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (id === 'new') {
    return NextResponse.json({
      clientId: '',
      date: new Date().toISOString(),
      eventName: '',
      medics: 1,
      hours: 1,
      hourlyRate: 150,
    })
  }

  const job = await prisma.job.findFirst({
    where: { id: id, userId: user.id },
    include: { client: true },
  })

  if (!job) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return NextResponse.json(job)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientId, date, eventName, medics, hours, hourlyRate } = await req.json()
  const totalCost = parseInt(medics) * parseFloat(hours) * parseFloat(hourlyRate)

  if (id === 'new') {
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

  const job = await prisma.job.update({
    where: { id: id },
    data: {
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.job.delete({
    where: { id: id },
  })

  return NextResponse.json({ success: true })
}
