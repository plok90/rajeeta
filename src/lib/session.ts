import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'rajeeta-secret-key')

export interface SessionUser {
  id: string
  username: string
  role: 'admin' | 'dentist'
  name: string
  dentistId?: string
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(SECRET)
  
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
