'use client'

import { mockPosts } from '@/lib/types'
import { useState, useEffect } from 'react'

export default function FeedPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs text-[var(--muted)] mb-1">{'>'} news_module</p>
        <h1 className="text-2xl sm:text-3xl font-bold glow">Tech News_</h1>
      </div>

      <div className="space-y-4">
        {mockPosts.map((post, i) => (
          <article 
            key={post.id} 
            className="card p-4 sm:p-5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: `all 0.3s ease ${i * 0.1}s` }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-2 glow-subtle">
              {post.title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--foreground-dim)] mb-3 sm:mb-4">{post.content}</p>
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-[var(--muted)]">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
              <span>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}