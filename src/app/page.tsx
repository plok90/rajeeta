'use client'

import { useState } from 'react'
import { useApp } from '@/app/providers'
import { Stethoscope, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { t } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t.auth.loginError)
        return
      }

      window.location.href = '/dashboard'
    } catch {
      setError(t.auth.loginError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t.app.name}</h1>
          <p className="text-muted mt-1">{t.app.tagline}</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">{t.auth.welcomeBack}</h2>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t.auth.username}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder={t.auth.username}
                required
              />
            </div>

            <div>
              <label className="label">{t.auth.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder={t.auth.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? t.common.loading : t.auth.loginButton}
            </button>
          </form>

          <div className="mt-6 p-3 bg-primary-light/50 rounded-lg text-xs text-muted">
            <p className="font-medium text-foreground mb-1">Demo Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>Dentist: dr.ahmed / dentist123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
