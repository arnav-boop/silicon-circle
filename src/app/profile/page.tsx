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
    if (username) {
      setTimeout(() => setNewUsername(username), 0)
    }
  }, [username])

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, interests')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setBio(data.bio || '')
        setInterests(data.interests || '')
      }
    }
    fetchProfile()
  }, [user, supabase])

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

  const handleSaveChanges = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ bio, interests })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      alert('Failed to update profile: ' + error.message)
    } else {
      alert('Profile updated successfully!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">{'>'} profile_module</p>
        <h1 className="text-3xl sm:text-4xl font-bold glow">profile_</h1>
      </div>

      <div className="card p-5 sm:p-7 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 sm:w-18 h-14 sm:h-18 border border-[var(--border)] flex items-center justify-center text-2xl sm:text-3xl font-bold glow">
            {username?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1">
            {editingUsername ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="input text-base py-1.5"
                  placeholder="username"
                />
                <button 
                  onClick={handleSaveUsername}
                  disabled={saving}
                  className="btn-primary text-base py-1.5 px-3"
                >
                  {saving ? '...' : '✓'}
                </button>
                <button 
                  onClick={() => setEditingUsername(false)}
                  className="btn-secondary text-base py-1.5 px-3"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold glow-subtle">
                  @{username || user.email?.split('@')[0]}
                </h2>
                <button 
                  onClick={() => setEditingUsername(true)}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] px-2 py-0.5 rounded"
                >
                  edit
                </button>
              </div>
            )}
            <p className="text-sm text-[var(--muted)] mt-1">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm sm:text-base mb-1 text-[var(--muted)]">bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input h-24 text-base"
            placeholder="about you..."
          />
        </div>

        <div>
          <label className="block text-sm sm:text-base mb-1 text-[var(--muted)]">interests</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="input text-base"
            placeholder="Python, Web Dev, AI..."
          />
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="btn-primary text-base py-3 px-6 w-full sm:w-auto"
        >
          {saving ? '[ saving... ]' : '[ save changes ]'}
        </button>
      </div>
    </div>
  )
}
