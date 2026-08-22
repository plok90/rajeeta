'use client'

import { useApp } from '@/app/providers'
import { Globe, Moon, Sun } from 'lucide-react'

export default function SettingsPage() {
  const { t, locale, setLocale, theme, setTheme } = useApp()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>

      <div className="card">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Globe size={18} /> {t.settings.language}</h3>
        <div className="flex gap-2">
          <button onClick={() => setLocale('en')} className={`btn ${locale === 'en' ? 'btn-primary' : 'btn-secondary'}`}>English</button>
          <button onClick={() => setLocale('ar')} className={`btn ${locale === 'ar' ? 'btn-primary' : 'btn-secondary'}`}>{t.settings.arabic}</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Theme
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setTheme('light')} className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}>Light</button>
          <button onClick={() => setTheme('dark')} className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}>Dark</button>
        </div>
      </div>
    </div>
  )
}
