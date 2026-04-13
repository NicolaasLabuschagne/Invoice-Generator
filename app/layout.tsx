import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SidebarWrapper from '@/components/SidebarWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Service Quote & Invoice SaaS',
  description: 'Manage clients, jobs, quotes, and invoices with ease.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </body>
    </html>
  )
}
