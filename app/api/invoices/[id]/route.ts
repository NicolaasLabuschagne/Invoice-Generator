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

  const invoice = await prisma.invoice.findFirst({
    where: { id: id, userId: user.id },
    include: { client: true, jobs: true },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return NextResponse.json(invoice)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status, totalAmount, discount, discountAmount, jobIds } = await req.json()

  const invoice = await prisma.invoice.update({
    where: { id: id, userId: user.id },
    data: {
      status,
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      discount: discount !== undefined ? parseFloat(discount) : undefined,
      discountAmount: discountAmount !== undefined ? parseFloat(discountAmount) : undefined,
      jobs: jobIds ? {
        set: jobIds.map((id: string) => ({ id }))
      } : undefined
    },
  })

  return NextResponse.json(invoice)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.invoice.delete({
    where: { id: id, userId: user.id },
  })

  return NextResponse.json({ success: true })
}
