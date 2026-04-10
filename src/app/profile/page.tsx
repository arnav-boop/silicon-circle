'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, loading, username, updateUsername } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (username) setNewUsername(username)
  }, [username])

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

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) return
    setSaving(true)
    const { error } = await updateUsername(newUsername.trim())
    setSaving(false)
    if (error) {
      alert('Failed to update username: ' + error.message)
    } else {
      setEditingUsername(false)
    }
  }

  const handleSaveBio = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      alert('Failed to update bio: ' + error.message)
    }
  }

  const handleSaveInterests = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ interests })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      alert('Failed to update interests: ' + error.message)
    }
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
            {username?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1">
            {editingUsername ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="input text-sm py-1"
                  placeholder="username"
                />
                <button 
                  onClick={handleSaveUsername}
                  disabled={saving}
                  className="btn-primary text-sm py-1 px-2"
                >
                  {saving ? '...' : '✓'}
                </button>
                <button 
                  onClick={() => setEditingUsername(false)}
                  className="btn-secondary text-sm py-1 px-2"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold glow-subtle">
                  @{username || user.email?.split('@')[0]}
                </h2>
                <button 
                  onClick={() => setEditingUsername(true)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  edit
                </button>
              </div>
            )}
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