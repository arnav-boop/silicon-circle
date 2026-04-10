'use client'

import { mockHackathons } from '@/lib/types'
import { useState, useEffect } from 'react'

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState(mockHackathons)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const toggleJoin = (id: string) => {
    setHackathons(hackathons.map(h => 
      h.id === id ? { ...h, joined: !h.joined, participants: h.participants + (h.joined ? -1 : 1) } : h
    ))
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs text-[var(--muted)] mb-1">{'>'} hackathon_module</p>
        <h1 className="text-2xl sm:text-3xl font-bold glow">Hackathons_</h1>
      </div>

      <div className="space-y-4">
        {hackathons.map((hackathon, i) => (
          <div 
            key={hackathon.id} 
            className="card p-4 sm:p-5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: `all 0.3s ease ${i * 0.1}s` }}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold mb-1 glow-subtle">
                  {hackathon.title}
                </h2>
                <p className="text-sm sm:text-base text-[var(--foreground-dim)] mb-2 sm:mb-3">{hackathon.description}</p>
                <div className="flex items-center gap-4 sm:gap-6 text-xs text-[var(--muted)]">
                  <span>{hackathon.date}</span>
                  <span>{hackathon.participants} participants</span>
                </div>
              </div>
              <button
                onClick={() => toggleJoin(hackathon.id)}
                className={`${hackathon.joined ? 'btn-secondary' : 'btn-primary'} text-sm py-2 px-4 w-full sm:w-auto`}
              >
                {hackathon.joined ? '[leave]' : '[join]'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}