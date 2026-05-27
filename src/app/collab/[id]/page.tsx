'use client'

import { useState, useEffect, use } from 'react'
import { useAuth } from '@/context/AuthContext'
import { mockIdeas, mockIdeaComments } from '@/lib/types'
import CommentSection from '@/components/CommentSection'
import Link from 'next/link'

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [upvotes, setUpvotes] = useState(0)

  const idea = mockIdeas.find(i => i.id === resolvedParams.id)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(true)
      if (idea) {
        setUpvotes(idea.upvotes)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [idea])

  const handleUpvote = () => {
    if (!user) return
    setUpvoted(!upvoted)
    setUpvotes(prev => upvoted ? prev - 1 : prev + 1)
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <p className="text-[var(--muted)]">[idea not found]</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-4">
        <Link href="/collab" className="text-sm text-[var(--muted)] hover:text-[var(--foreground-dim)] transition-colors">
          ← back to ideas
        </Link>
      </div>

      <article
        className="card p-4 sm:p-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease'
        }}
      >
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold glow mb-3">
            {idea.title}
          </h1>
          <p className="text-sm text-[var(--foreground-dim)] mb-4">
            {idea.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>by @{idea.author?.username || 'anonymous'}</span>
            <span>{new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>

        <div className="flex items-start gap-3 mb-6">
          <button
            onClick={handleUpvote}
            disabled={!user}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded transition-all ${
              user
                ? upvoted
                  ? 'text-[var(--foreground)] hover:brightness-110'
                  : 'text-[var(--muted)] hover:text-[var(--foreground-dim)]'
                : 'text-[var(--muted)] cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={upvoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-xs sm:text-sm font-bold">{upvotes}</span>
          </button>
          <div className="flex-1">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Problem</p>
            <p className="text-sm sm:text-base text-[var(--foreground-dim)]">{idea.problem}</p>
          </div>
        </div>

        <div className="mb-6 p-3 sm:p-4 border border-[var(--border)] rounded bg-[var(--card-bg)]/50">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Solution</p>
          <p className="text-sm sm:text-base text-[var(--foreground-dim)]">{idea.solution}</p>
        </div>

        {idea.sketch_url && (
          <div className="mb-6">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Sketch / Draft</p>
            <div className="border border-[var(--border)] rounded p-4 sm:p-6 bg-[var(--card-bg)]/30 flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--muted)] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-[var(--muted)]">Sketch: {idea.sketch_url}</p>
                <p className="text-xs text-[var(--muted)] mt-1">[Image placeholder - upload sketch file to see it here]</p>
              </div>
            </div>
          </div>
        )}

        {user ? (
          <div className="mb-6">
            <CommentSection ideaId={idea.id} comments={mockIdeaComments[idea.id] || []} />
          </div>
        ) : (
          <div className="mb-6 p-4 border border-[var(--border)] rounded text-center">
            <p className="text-sm text-[var(--muted)] mb-2">Login to join the conversation</p>
            <Link href="/login" className="btn-primary text-sm py-2 px-4 inline-block">[login to comment]</Link>
          </div>
        )}
      </article>
    </div>
  )
}
