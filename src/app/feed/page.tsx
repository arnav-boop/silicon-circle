'use client'

import { Post } from '@/lib/types'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = createClient()

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching posts:', error.message)
    } else if (data) {
      setPosts(data as Post[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleAddPost = async () => {
    if (!title.trim() || !content.trim() || !user) return

    const { error } = await supabase.from('posts').insert({
      title: title.trim(),
      content: content.trim(),
      author_id: user.id,
      created_at: new Date().toISOString()
    })

    if (error) {
      alert('Error creating post: ' + error.message)
    } else {
      setTitle('')
      setContent('')
      setShowAddForm(false)
      fetchPosts()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">{'>'} news_module</p>
          <h1 className="text-2xl sm:text-3xl font-bold glow">Tech News_</h1>
        </div>
        {user && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn-primary text-sm sm:text-base py-2 px-4"
          >
            {showAddForm ? '[hide]' : '[+ write news]'}
          </button>
        )}
      </div>

      {showAddForm && user && (
        <div className="card p-4 sm:p-5 mb-6">
          <h2 className="text-lg font-bold mb-3 glow-subtle">Post a News Update_</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Title</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tech update title..."
                className="input w-full"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Content</p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your update here..."
                className="input w-full h-32 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddPost} className="btn-primary flex-1">
                [publish news]
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary px-4">
                [cancel]
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-[var(--muted)]">{'>'} loading news feed...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No posts shared yet.</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="card p-4 sm:p-5">
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
            ))
          )}
        </div>
      )}
    </div>
  )
}