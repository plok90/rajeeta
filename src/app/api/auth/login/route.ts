import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, hashPassword } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }
    
    const user = await authenticateUser(username, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    await createSession(user)
    
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username, role: user.role, name: user.name } 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
