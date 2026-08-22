'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getTranslations, Locale } from '@/i18n'

type Theme = 'light' | 'dark'

interface AppContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslations>
  dir: 'ltr' | 'rtl'
  theme: Theme
  setTheme: (theme: Theme) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [theme, setThemeState] = useState<Theme>('light')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedLocale) setLocaleState(savedLocale)
    if (savedTheme) setThemeState(savedTheme)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = locale
      localStorage.setItem('locale', locale)
    }
  }, [locale, mounted])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  const setLocale = (l: Locale) => setLocaleState(l)
  const setTheme = (t: Theme) => setThemeState(t)

  const t = getTranslations(locale)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <AppContext.Provider value={{ locale, setLocale, t, dir, theme, setTheme, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within Providers')
  return context
}
