'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="glow">{'>'} loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs text-[var(--muted)] mb-1">{'>'} profile_module</p>
        <h1 className="text-xl sm:text-2xl font-bold glow">profile_</h1>
      </div>

      <div className="card p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 sm:w-16 h-12 sm:h-16 border border-[var(--border)] flex items-center justify-center text-xl sm:text-2xl font-bold glow">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold glow-subtle">
              {user.email?.split('@')[0]}
            </h2>
            <p className="text-xs text-[var(--muted)]">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1 text-[var(--muted)]">bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input h-20 text-sm"
            placeholder="about you..."
          />
        </div>

        <div>
          <label className="block text-xs mb-1 text-[var(--muted)]">interests</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="input text-sm"
            placeholder="Python, Web Dev, AI..."
          />
        </div>

        <button className="btn-primary text-base w-full sm:w-auto">
          [ save changes ]
        </button>
      </div>
    </div>
  )
}