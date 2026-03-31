import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.setting.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  return NextResponse.json({ settings, profile })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (body.type === 'profile') {
    const {
      logoUrl,
      themeColor,
      companyName,
      companyAddress,
      companyEmail,
      companyPhone,
      invoiceTemplate,
      quoteTemplate
    } = body

    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        logoUrl,
        themeColor,
        companyName,
        companyAddress,
        companyEmail,
        companyPhone,
        invoiceTemplate,
        quoteTemplate,
      },
    })

    return NextResponse.json(profile)
  }

  const { name, value } = body

  const setting = await prisma.setting.create({
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

  await prisma.setting.delete({
    where: { id: id },
  })

  return NextResponse.json({ success: true })
}
