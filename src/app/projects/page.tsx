'use client'

import { Project } from '@/lib/types'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'

interface ProjectForm {
  title: string
  description: string
  tech: string
  url: string
}

export default function ProjectsPage() {
  const { user, username } = useAuth()
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ProjectForm>({ title: '', description: '', tech: '', url: '' })

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Fetch projects error:', error.message)
    } else if (data) {
      setProjects(data as Project[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const allTech = Array.from(new Set(projects.flatMap(p => p.tech || [])))
  
  const filteredProjects = projects.filter(p => {
    const techMatch = filter === 'all' || (p.tech && p.tech.includes(filter))
    const searchMatch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase())
    return techMatch && searchMatch
  })

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return

    const techArray = form.tech
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const authorName = username || user?.email?.split('@')[0] || 'anonymous'

    const { error } = await supabase.from('projects').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      tech: techArray,
      author: authorName,
      url: form.url.trim(),
      likes: 0
    })

    if (error) {
      alert('Error creating project: ' + error.message)
    } else {
      setForm({ title: '', description: '', tech: '', url: '' })
      setShowModal(false)
      fetchProjects()
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)] mb-1">{'>'} projects_module</p>
          <h1 className="text-3xl sm:text-4xl font-bold glow">Projects_</h1>
          <p className="text-base sm:text-lg text-[var(--foreground-dim)] mt-2">Built by the community</p>
        </div>
        {user && (
          <button onClick={() => setShowModal(true)} className="btn-primary text-base py-2.5 px-5 self-start sm:self-auto">
            [+ add project]
          </button>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input w-full max-w-sm text-base"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-base text-[var(--muted)]">{'>'} loading projects...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`text-base py-2 px-4 border ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              [all]
            </button>
            {allTech.map(tech => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`text-base py-2 px-4 border ${filter === tech ? 'btn-primary' : 'btn-secondary'}`}
              >
                [{tech}]
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <article key={project.id} className="card p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 glow-subtle">
                    {project.title}
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--foreground-dim)] mb-3 sm:mb-4">{project.description}</p>
                  
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                      {project.tech.map(tech => (
                        <span key={tech} className="text-sm border border-[var(--border)] px-2.5 py-1 text-[var(--muted)]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm text-[var(--muted)] pt-3 border-t border-[var(--border)]">
                    <span>by @{project.author}</span>
                    <span>♥ {project.likes || 0}</span>
                  </div>

                  {project.url && (
                    <div className="mt-3 flex justify-end">
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-[var(--accent)] hover:underline"
                      >
                        [visit site ↗]
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold glow">Upload Project_</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground-dim)] text-xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Title</p>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="My awesome app..."
                  className="input w-full"
                />
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Description</p>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does it do?"
                  className="input w-full h-24 resize-none"
                />
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Tech Stack (comma separated)</p>
                <input
                  type="text"
                  value={form.tech}
                  onChange={(e) => setForm({ ...form, tech: e.target.value })}
                  placeholder="React, Next.js, CSS..."
                  className="input w-full"
                />
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-1">URL (optional)</p>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="input w-full"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={handleSubmit} className="btn-primary flex-1">
                  [upload project]
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