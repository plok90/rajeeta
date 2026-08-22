'use client'

import { useApp } from '@/app/providers'
import { Globe, Sun, Moon, Menu, User } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header() {
  const { t, locale, setLocale, theme, setTheme, setSidebarOpen } = useApp()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => setUserName(data.user?.name || ''))
      .catch(() => {})
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-muted hover:text-foreground"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          className="btn btn-secondary text-xs"
        >
          <Globe size={16} />
          {locale === 'en' ? 'العربية' : 'English'}
        </button>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="btn btn-secondary p-2"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {userName && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <span className="hidden sm:inline font-medium">{userName}</span>
          </div>
        )}
      </div>
    </header>
  )
}
