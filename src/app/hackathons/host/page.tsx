'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const themes = [
  { value: 'innovation', label: 'Innovation & Emerging Tech', icon: '🚀' },
  { value: 'web3', label: 'Web3 & Blockchain', icon: '₿' },
  { value: 'ai', label: 'AI & Machine Learning', icon: '🤖' },
  { value: 'education', label: 'Education & Learning', icon: '📚' },
  { value: 'social', label: 'Social Impact', icon: '🌍' },
  { value: 'health', label: 'Health & Wellness', icon: '🏥' },
  { value: 'finance', label: 'Finance & Fintech', icon: '💰' },
  { value: 'gaming', label: 'Gaming & Entertainment', icon: '🎮' },
  { value: 'environment', label: 'Environment & Sustainability', icon: '🌱' },
  { value: 'open', label: 'Open Theme', icon: '🎨' },
]

export default function HostHackathonPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [about, setAbout] = useState('')
  const [theme, setTheme] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [generatedInfo, setGeneratedInfo] = useState<{ description: string; tags: string[]; duration: string } | null>(null)

  const generateHackathonInfo = () => {
    if (!about.trim()) return

    const keywords: Record<string, string[]> = {
      'ai': ['AI', 'machine-learning', 'neural-networks', 'automation'],
      'web3': ['blockchain', 'decentralized', 'smart-contracts', 'crypto'],
      'education': ['learning', 'education', 'students', 'teaching'],
      'social': ['community', 'social-impact', 'nonprofit', 'volunteer'],
      'health': ['healthcare', 'medical', 'wellness', 'fitness'],
      'finance': ['fintech', 'payments', 'banking', 'financial'],
      'gaming': ['games', 'entertainment', 'interactive', 'fun'],
      'environment': ['climate', 'sustainability', 'green-tech', 'eco'],
      'innovation': ['innovation', 'startup', 'tech', 'cutting-edge'],
      'open': ['creativity', 'open', 'anything', 'build']
    }

    const selectedTheme = themes.find(t => t.value === theme)
    const tags = keywords[theme] || ['innovation', 'coding', 'projects']

    const description = `${selectedTheme?.label || 'Tech'} hackathon: ${about}. ` +
      `Build amazing projects and collaborate with fellow developers. ` +
      `Prizes, networking, and learning opportunities await!`

    setGeneratedInfo({
      description,
      tags,
      duration: '48 hours'
    })

    if (!title) {
      const autoTitle = `Silicon Circle ${selectedTheme?.label || 'Hackathon'} 2024`
      setTitle(autoTitle)
    }
  }

  const handleCreate = async () => {
    if (!title || !date || !generatedInfo || !user) return

    const { error } = await supabase.from('hackathons').insert({
      title: title.trim(),
      description: generatedInfo.description,
      date: date,
      theme: theme,
      tags: generatedInfo.tags,
      participants: 0,
      organizer_id: user.id
    })

    if (error) {
      alert('Error creating hackathon: ' + error.message)
    } else {
      setAbout('')
      setTheme('')
      setTitle('')
      setDate('')
      setGeneratedInfo(null)
      router.push('/hackathons')
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-4">
          <Link href="/hackathons" className="text-sm sm:text-base text-[var(--muted)] hover:text-[var(--foreground-dim)] transition-colors">
            ← back to hackathons
          </Link>
        </div>
        <div className="p-6 border border-[var(--border)] rounded text-center">
          <p className="text-base text-[var(--muted)] mb-4">Login to host hackathons</p>
          <Link href="/login" className="btn-primary text-base py-2.5 px-5 inline-block">[login to host]</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-4">
        <Link href="/hackathons" className="text-sm sm:text-base text-[var(--muted)] hover:text-[var(--foreground-dim)] transition-colors">
          ← back to hackathons
        </Link>
      </div>

      <div className="mb-6 sm:mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">{'>'} host_hackathon_module</p>
        <h1 className="text-3xl sm:text-4xl font-bold glow">Host Hackathon_</h1>
        <p className="text-base sm:text-lg text-[var(--foreground-dim)] mt-2">Create your own hackathon event</p>
      </div>

      <div className="space-y-6">
        <div className="card p-5 sm:p-6">
          <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-3">What is it about?</p>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Describe what your hackathon focuses on, what problems participants will solve..."
            className="input w-full h-28 resize-none text-base"
          />
        </div>

        <div className="card p-5 sm:p-6">
          <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-3">Theme</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`p-3 sm:p-4 border text-left transition-all ${
                  theme === t.value
                    ? 'border-[var(--foreground)] bg-[var(--foreground)]/10'
                    : 'border-[var(--border)] hover:border-[var(--foreground-dim)]'
                }`}
              >
                <span className="text-xl mr-2">{t.icon}</span>
                <span className="text-sm sm:text-base">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateHackathonInfo}
          disabled={!about || !theme}
          className="btn-primary w-full text-base py-3"
        >
          [generate hackathon info]
        </button>

        {generatedInfo && (
          <div className="card p-5 sm:p-6 space-y-4">
            <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Generated Details</p>

            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Title</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full text-base"
              />
            </div>

            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Description</p>
              <p className="text-sm text-[var(--foreground-dim)] bg-[var(--card-bg)]/50 p-3 border border-[var(--border)]">
                {generatedInfo.description}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)] mb-2">Suggested Tags</p>
              <div className="flex flex-wrap gap-2">
                {generatedInfo.tags.map(tag => (
                  <span key={tag} className="text-xs border border-[var(--border)] px-2 py-1 text-[var(--muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Duration</p>
              <p className="text-sm text-[var(--foreground-dim)]">{generatedInfo.duration}</p>
            </div>

            <button
              onClick={handleCreate}
              disabled={!title || !date}
              className="btn-primary w-full"
            >
              [create hackathon]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}