'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/'

  if (isAuthPage) {
    return <main className="w-full">{children}</main>
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
