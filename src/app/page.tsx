'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

const features = [
  { title: 'News', description: 'Tech news & updates', href: '/feed', cmd: '> news' },
  { title: 'Hackathons', description: 'Join upcoming events', href: '/hackathons', cmd: '> hackathons' },
  { title: 'Chat', description: 'Community chat rooms', href: '/chat', cmd: '> chat' }
]

const bootSequence = [
  '> initializing silicon_circle...',
  '> loading modules...',
  '> checking database connection... [OK]',
  '> loading user data... [OK]',
  '> system ready_'
]

export default function Home() {
  const [lines, setLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [ booted, setBooted] = useState(false)
  const [stats, setStats] = useState({ users: 0, messages: 0, hackathons: 0 })
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const terminalInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const cursorTimer = setInterval(() => setShowCursor(v => !v), 300)
    return () => clearInterval(cursorTimer)
  }, [])

  useEffect(() => {
    if (currentLine >= bootSequence.length) {
      setBooted(true)
      setStats({ users: 247, messages: 1842, hackathons: 12 })
      return
    }

    const line = bootSequence[currentLine]
    if (currentChar <= line.length) {
      const timer = setTimeout(() => {
        setCurrentChar(c => c + 1)
      }, 5 + Math.random() * 8)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, line])
        setCurrentLine(l => l + 1)
        setCurrentChar(0)
      }, 40)
      return () => clearTimeout(timer)
    }
  }, [currentLine, currentChar])

  useEffect(() => {
    if (booted) {
      const messages = [
        'user_42 joined the community',
        'new hackathon announced: Global Teen Hackathon 2024',
        'channel #python: "just started learning python!"',
      ]
      let i = 0
      const timer = setInterval(() => {
        if (i < messages.length) {
          setTerminalLines(prev => [...prev.slice(-2), messages[i]])
          i++
        }
      }, 3000)
      return () => clearInterval(timer)
    }
  }, [booted])

  return (
    <div className="min-h-screen px-2 sm:px-4">
      <section className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <pre className="block sm:hidden text-xs mb-4 text-[var(--foreground-dim)] glow-subtle font-mono leading-tight whitespace-pre w-full">
{` ____  ____  ____  ____  ____
(___)(___)(___)(___)(___)
(__) SILICON CIRCLE (__)
(__)(___)(___)(___)(___)
(___)(___)(___)(___)(___)`}</pre>
          <pre className="hidden sm:block text-xs md:text-xs mb-4 sm:mb-6 text-[var(--foreground-dim)] glow-subtle font-mono leading-tight whitespace-pre w-full max-w-none">
{` ____  ____  ____  ____  ____  ____  ____  ____
(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)
(__) (__) (__) (__) (__) (__) (__) (__) (__) (__)
(__) SILICON CIRCLE (__) (__) (__) (__) (__)
(__)(___)(___)(___)(___)(___)(___)(___)(___)(___)
(___)(___)(___)(___)(___)(___)(___)(___)(___)(___)
`}</pre>

          <div className="mb-2 text-sm sm:text-xs md:text-xs font-mono">
            {lines.map((line, i) => (
              <div key={i} className="text-[var(--foreground-dim)]">{line}</div>
            ))}
            <div className="text-[var(--foreground)]">
              {currentLine < bootSequence.length ? bootSequence[currentLine].slice(0, currentChar) : ''}
              <span style={{ opacity: showCursor ? 1 : 0 }}>_</span>
            </div>
          </div>

          {booted && (
            <>
              <p className="text-lg sm:text-xl text-[var(--foreground)] mb-4 sm:mb-6 glow">
                Tech community for teens_
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link href="/login" className="btn-primary text-center">
                  [ Join Now ]
                </Link>
                <Link href="/chat" className="btn-secondary text-center">
                  [ Explore ]
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {booted && (
        <>
          <section className="py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="card p-3 sm:p-4 text-center">
                  <p className="text-xs text-[var(--muted)]">users online</p>
                  <p className="text-xl sm:text-2xl font-bold glow">{stats.users}</p>
                </div>
                <div className="card p-3 sm:p-4 text-center">
                  <p className="text-xs text-[var(--muted)]">messages</p>
                  <p className="text-xl sm:text-2xl font-bold glow">{stats.messages}</p>
                </div>
                <div className="card p-3 sm:p-4 text-center">
                  <p className="text-xs text-[var(--muted)]">hackathons</p>
                  <p className="text-xl sm:text-2xl font-bold glow">{stats.hackathons}</p>
                </div>
                <div className="card p-3 sm:p-4 text-center">
                  <p className="text-xs text-[var(--muted)]">status</p>
                  <p className="text-xl sm:text-2xl font-bold glow-subtle text-[var(--foreground)]">ONLINE</p>
                </div>
              </div>

              <h2 className="text-base sm:text-lg mb-3 sm:mb-4 text-[var(--foreground-dim)]">
                {'> available modules'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {features.map((feature, i) => (
                  <Link 
                    key={feature.href} 
                    href={feature.href} 
                    className="card p-4 hover:border-[var(--foreground)] transition-all"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <p className="text-xs text-[var(--muted)] mb-1">{feature.cmd}</p>
                    <h3 className="text-base sm:text-lg font-bold mb-1 glow-subtle">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">{feature.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-base sm:text-lg mb-3 sm:mb-4 text-[var(--foreground-dim)]">
                {'> recent activity'}
              </h2>
              <div className="card p-3 sm:p-4 font-mono text-sm">
                {terminalLines.map((line, i) => (
                  <div key={i} className="text-[var(--foreground-dim)] mb-1">
                    <span className="text-[var(--muted)]">[{new Date().toLocaleTimeString()}]</span> {line}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-6 sm:py-8 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-base sm:text-lg mb-3 sm:mb-4 text-[var(--foreground-dim)]">
                {'> about'}
              </h2>
              <div className="card p-4 sm:p-5">
                <p className="text-sm sm:text-base text-[var(--foreground-dim)] mb-3 sm:mb-4">
                  Built by teens, for teens. A space to learn, share, and grow together.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'JavaScript', 'AI/ML', 'Web Dev', 'Game Dev'].map((tech) => (
                    <span key={tech} className="text-xs border border-[var(--border)] px-2 py-1 text-[var(--muted)]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="py-4 sm:py-6 px-3 sm:px-4 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center text-[var(--muted)] text-xs">
          <p>{'>'} © 2024 silicon_circle. system: {booted ? 'online_' : 'booting...'}</p>
        </div>
      </footer>
    </div>
  )
}