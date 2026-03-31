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
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { defaultHourlyRate: true }
    })

    return NextResponse.json({
      clientId: '',
      date: new Date().toISOString(),
      eventName: '',
      quantity: 1,
      hours: 1,
      startTime: '',
      endTime: '',
      hourlyRate: profile?.defaultHourlyRate || 0,
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

  const { clientId, date, eventName, quantity, hours, startTime, endTime, hourlyRate, selectedItems, isComplete } = await req.json()

  const itemsTotal = Array.isArray(selectedItems)
    ? selectedItems.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
    : 0

  const totalCost = (parseInt(quantity) * parseFloat(hours) * parseFloat(hourlyRate)) + itemsTotal

  if (id === 'new') {
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        clientId,
        date: new Date(date),
        eventName,
        quantity: parseInt(quantity),
        hours: parseFloat(hours),
        startTime,
        endTime,
        hourlyRate: parseFloat(hourlyRate),
        totalCost,
        selectedItems: selectedItems || [],
        isComplete: isComplete || false,
      },
    })
    return NextResponse.json(job)
  }

  const job = await prisma.job.update({
    where: { id: id, userId: user.id },
    data: {
      clientId,
      date: new Date(date),
      eventName,
      quantity: parseInt(quantity),
      hours: parseFloat(hours),
      startTime,
      endTime,
      hourlyRate: parseFloat(hourlyRate),
      totalCost,
      selectedItems: selectedItems || [],
      isComplete: isComplete || false,
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
    where: { id: id, userId: user.id },
  })

  return NextResponse.json({ success: true })
}
