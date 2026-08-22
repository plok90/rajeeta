'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/app/providers'
import {
  LayoutDashboard,
  Users,
  Search,
  UserPlus,
  Calendar,
  Stethoscope,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'patients', href: '/patients', icon: Users },
  { key: 'searchPatients', href: '/patients/search', icon: Search },
  { key: 'addPatient', href: '/patients/new', icon: UserPlus },
  { key: 'appointments', href: '/appointments', icon: Calendar },
  { key: 'dentalChart', href: '/dental-chart', icon: Stethoscope },
  { key: 'treatments', href: '/treatments', icon: Activity },
  { key: 'reports', href: '/reports', icon: BarChart3 },
  { key: 'settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { t, dir, sidebarOpen, setSidebarOpen } = useApp()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 z-50 bg-card border border-border rounded-lg p-2 shadow-sm lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full w-64 bg-sidebar-bg text-sidebar-text z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">{t.app.name}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-text hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : 'text-sidebar-text'}`}
              >
                <Icon size={18} />
                <span>{t.sidebar[item.key as keyof typeof t.sidebar]}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-sidebar-text hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>{t.auth.logout}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
