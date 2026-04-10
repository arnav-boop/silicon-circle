'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { themes, Theme } from '@/lib/themes'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-base sm:text-sm hover:opacity-70 transition-opacity"
        style={{ color: 'var(--foreground)' }}
      >
        ◐
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 z-50 rounded shadow-lg"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
        >
          <div className="p-2 text-xs" style={{ color: 'var(--muted)' }}>
            Select Theme
          </div>
          {(Object.keys(themes) as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{
                background: theme === t ? 'var(--border)' : 'transparent',
                color: 'var(--foreground)'
              }}
            >
              {themes[t].id === '80s' && '💻 '}
              {themes[t].id === '90s' && '🖥️ '}
              {themes[t].id === '2000s' && '✨ '}
              {themes[t].id === '2010s' && '🍎 '}
              {themes[t].id === '2020s' && '◼️ '}
              {themes[t].id === 'frutiger' && '🌊 '}
              {themes[t].name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
