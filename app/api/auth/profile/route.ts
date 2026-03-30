import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // If user provided in body (for signup case before session is established)
    try {
      const body = await req.json()
      if (body.userId && body.email) {
        await prisma.profile.upsert({
          where: { id: body.userId },
          update: { email: body.email },
          create: { id: body.userId, email: body.email },
        })
        return NextResponse.json({ success: true })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.profile.upsert({
    where: { id: user.id },
    update: { email: user.email! },
    create: { id: user.id, email: user.email! },
  })

  return NextResponse.json({ success: true })
}
