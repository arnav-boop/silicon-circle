'use client'

import { mockProjects } from '@/lib/types'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

interface ProjectForm {
  title: string
  description: string
  tech: string
  url: string
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ProjectForm>({ title: '', description: '', tech: '', url: '' })

  const allTech = Array.from(new Set(mockProjects.flatMap(p => p.tech)))
  const filteredProjects = filter === 'all'
    ? mockProjects
    : mockProjects.filter(p => p.tech.includes(filter))

  const handleSubmit = () => {
    if (form.title && form.description) {
      alert(`Project "${form.title}" uploaded! (mock)`)
      setForm({ title: '', description: '', tech: '', url: '' })
      setShowModal(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs text-[var(--muted)] mb-1">{'>'} projects_module</p>
        <h1 className="text-2xl sm:text-3xl font-bold glow">Projects_</h1>
        <p className="text-sm sm:text-base text-[var(--foreground-dim)] mt-2">Built by the community</p>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-sm py-1.5 px-3 border ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          [all]
        </button>
        {allTech.map(tech => (
          <button
            key={tech}
            onClick={() => setFilter(tech)}
            className={`text-sm py-1.5 px-3 border ${filter === tech ? 'btn-primary' : 'btn-secondary'}`}
          >
            [{tech}]
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProjects.map((project, i) => (
          <article 
            key={project.id} 
            className="card p-4 sm:p-5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: `all 0.3s ease ${i * 0.1}s` }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-2 glow-subtle">
              {project.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--foreground-dim)] mb-3 sm:mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              {project.tech.map(tech => (
                <span key={tech} className="text-xs border border-[var(--border)] px-2 py-1 text-[var(--muted)]">
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>by @{project.author}</span>
              <span>♥ {project.likes}</span>
            </div>

            {user && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border)]">
                <button className="btn-secondary text-sm py-1.5 px-3 w-full sm:w-auto">
                  [view details]
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {user && (
        <div className="mt-6 sm:mt-8">
          <button onClick={() => setShowModal(true)} className="btn-primary text-base py-3 px-6">
            [+ add project]
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold glow">Upload Project_</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground-dim)]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Title</p>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="My awesome app..."
                  className="input w-full"
                />
              </div>

              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Description</p>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does it do?"
                  className="input w-full h-24 resize-none"
                />
              </div>

              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Tech Stack</p>
                <input
                  type="text"
                  value={form.tech}
                  onChange={(e) => setForm({ ...form, tech: e.target.value })}
                  placeholder="React, Next.js, etc..."
                  className="input w-full"
                />
              </div>

              <div>
                <p className="text-xs text-[var(--muted)] mb-1">URL (optional)</p>
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