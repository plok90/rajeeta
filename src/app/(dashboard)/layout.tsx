'use client'

import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { useApp } from '@/app/providers'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useApp()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`${dir === 'rtl' ? 'mr-0 lg:mr-64' : 'ml-0 lg:ml-64'} transition-all`}>
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
