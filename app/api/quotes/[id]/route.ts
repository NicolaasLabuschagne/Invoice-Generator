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

  const quote = await prisma.quote.findFirst({
    where: { id: id, userId: user.id },
    include: { client: true, jobs: true },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return NextResponse.json(quote)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { totalAmount, discount, discountAmount, jobIds } = await req.json()

  const quote = await prisma.quote.update({
    where: { id: id, userId: user.id },
    data: {
      totalAmount: parseFloat(totalAmount),
      discount: parseFloat(discount),
      discountAmount: parseFloat(discountAmount),
      jobs: {
        set: jobIds.map((id: string) => ({ id }))
      }
    },
  })

  return NextResponse.json(quote)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.quote.delete({
    where: { id: id, userId: user.id },
  })

  return NextResponse.json({ success: true })
}
