import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, contactPerson, phone, email, address } = await req.json()

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name,
      contactPerson,
      phone,
      email,
      address,
    },
  })

  return NextResponse.json(client)
}
