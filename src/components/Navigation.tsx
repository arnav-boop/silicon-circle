'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeSelector from '@/components/ThemeSelector'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'News' },
  { href: '/hackathons', label: 'Hacks' },
  { href: '/projects', label: 'Projects' },
  { href: '/friends', label: 'Friends' },
  { href: '/chat', label: 'Chat' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card-bg)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link href="/" className="text-lg sm:text-xl font-bold glow">
          Silicon Circle_
        </Link>
        
        <div className="hidden sm:flex items-center gap-4 sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`link text-sm ${pathname === link.href ? 'text-[var(--foreground-dim)]' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          
          <ThemeSelector />
          
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/profile" className="link text-sm">
                Profile
              </Link>
              <button onClick={() => signOut()} className="btn-secondary text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-1.5 sm:py-2 px-3 sm:px-4">
              Login
            </Link>
          )}
        </div>

        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="sm:hidden text-lg"
          style={{ color: 'var(--foreground)' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-[var(--border)] px-3 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm ${pathname === link.href ? 'text-[var(--foreground-dim)]' : 'text-[var(--foreground)]'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[var(--border)]">
            {user ? (
              <div className="space-y-2">
                <Link href="/profile" className="block py-2 text-sm text-[var(--foreground)]">
                  Profile
                </Link>
                <button onClick={() => signOut()} className="btn-secondary text-sm py-2 px-4 w-full">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4 block text-center">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}