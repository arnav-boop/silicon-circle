'use client'

import { Idea } from '@/lib/types'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface IdeaForm {
  title: string
  description: string
  problem: string
  solution: string
}

export default function CollabPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<IdeaForm>({ title: '', description: '', problem: '', solution: '' })

  const fetchIdeas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ideas')
      .select('*, author:profiles(username)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ideas:', error.message)
    } else if (data) {
      // Fetch comment counts for each idea
      const list = await Promise.all(data.map(async (idea: any) => {
        const { count } = await supabase
          .from('idea_comments')
          .select('*', { count: 'exact', head: true })
          .eq('idea_id', idea.id)
        
        return {
          ...idea,
          commentCount: count || 0
        }
      }))
      setIdeas(list)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchIdeas()
    const raf = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.problem.trim() || !form.solution.trim() || !user) return

    const { error } = await supabase.from('ideas').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      problem: form.problem.trim(),
      solution: form.solution.trim(),
      author_id: user.id,
      upvotes: 0,
      created_at: new Date().toISOString()
    })

    if (error) {
      alert('Error creating idea: ' + error.message)
    } else {
      setForm({ title: '', description: '', problem: '', solution: '' })
      setShowModal(false)
      fetchIdeas()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--muted)] mb-1">{'>'} collaboration_module</p>
          <h1 className="text-3xl sm:text-4xl font-bold glow">Collab Ideas_</h1>
          <p className="text-base sm:text-lg text-[var(--foreground-dim)] mt-2">Share ideas, get feedback, build together</p>
        </div>
        {user && (
          <button onClick={() => setShowModal(true)} className="btn-primary text-base py-2.5 px-5">
            [+ submit idea]
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-base text-[var(--muted)]">{'>'} loading collaboration ideas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ideas.map((idea, i) => (
            <Link
              key={idea.id}
              href={`/collab/${idea.id}`}
              className="card p-5 sm:p-6 block group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: `all 0.3s ease ${i * 0.05}s`
              }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded bg-[var(--foreground)]/10 border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--foreground-dim)] transition-colors">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--foreground-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 glow-subtle line-clamp-1">
                    {idea.title}
                  </h2>
                  <p className="text-base text-[var(--foreground-dim)] line-clamp-2 mb-3 sm:mb-4">
                    {idea.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                    <span className="truncate">by @{idea.author?.username || 'anonymous'}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {idea.upvotes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {idea.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-8 text-center p-5 sm:p-6 border border-[var(--border)] rounded">
          <p className="text-[var(--muted)] text-base sm:text-lg mb-3">
            Login to submit your own ideas and join the discussion
          </p>
          <Link href="/login" className="btn-primary text-base py-2 px-5">
            [login to participate]
          </Link>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold glow">Share Idea_</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground-dim)] text-xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Title (one-liner)</p>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What's your idea called?"
                  className="input w-full"
                />
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Short Description</p>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary..."
                  className="input w-full"
                />
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Problem it Solves</p>
                <textarea
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  placeholder="What pain point are you addressing?"
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Proposed Solution</p>
                <textarea
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  placeholder="How will it work?"
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={handleSubmit} className="btn-primary flex-1">
                  [share idea]
                </button>
                <button onClick={() => setShowModal(false)} className="btn-secondary px-4">
                  [cancel]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}