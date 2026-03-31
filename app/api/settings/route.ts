import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.serviceRate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, value } = await req.json()

  const setting = await prisma.serviceRate.create({
    data: {
      userId: user.id,
      name,
      value: parseFloat(value),
    },
  })

  return NextResponse.json(setting)
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  await prisma.serviceRate.delete({
    where: { id: id },
  })

  return NextResponse.json({ success: true })
}
