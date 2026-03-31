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
    quoteTemplate,
    bankInfo,
    licenceInfo,
    currency,
    medicHourlyRate,
    roundToNearest
  } = await req.json()

  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      logoUrl,
      themeColor,
      companyName,
      companyAddress,
      companyEmail,
      companyPhone,
      invoiceTemplate,
      quoteTemplate,
      bankInfo,
      licenceInfo,
      currency,
      medicHourlyRate: parseFloat(medicHourlyRate),
      roundToNearest: Boolean(roundToNearest),
    },
    create: {
      id: user.id,
      email: user.email!,
      logoUrl,
      themeColor,
      companyName,
      companyAddress,
      companyEmail,
      companyPhone,
      invoiceTemplate,
      quoteTemplate,
      bankInfo,
      licenceInfo,
      currency,
      medicHourlyRate: parseFloat(medicHourlyRate),
      roundToNearest: Boolean(roundToNearest),
    }
  })

  return NextResponse.json(profile)
}
