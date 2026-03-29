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

  const client = await prisma.client.findFirst({
    where: { id: id, userId: user.id },
  })

  if (!client) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, contactPerson, phone, email, address } = await req.json()

  const client = await prisma.client.update({
    where: { id: id, userId: user.id },
    data: {
      name,
      contactPerson,
      phone,
      email,
      address,
    },
  })

  return NextResponse.json(client)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.client.delete({
    where: { id: id, userId: user.id },
  })

  return NextResponse.json({ success: true })
}
