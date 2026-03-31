import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'
import React from 'react'
import DocumentPDF from '@/components/DocumentPDF'
import { renderToBuffer } from '@react-pdf/renderer'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string, id: string }> }
) {
  const { type, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let data
  if (type === 'quote') {
    data = await prisma.quote.findFirst({
      where: { id, userId: user.id },
      include: { client: true, jobs: true },
    })
  } else if (type === 'invoice') {
    data = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: { client: true, jobs: true },
    })
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const profile = await (prisma as any).profile.findUnique({
    where: { id: user.id },
  })

  const pdfType = type === 'quote' ? 'Quote' : 'Invoice'
  const buffer = await renderToBuffer(<DocumentPDF data={data} type={pdfType} profile={profile} />)

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${pdfType}-${data.id}.pdf"`,
    },
  })
}
