import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    logoUrl,
    themeColor,
    companyName,
    companyAddress,
    companyEmail,
    companyPhone,
    invoiceTemplate,
    quoteTemplate
  } = await req.json()

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
