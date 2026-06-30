'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import type { IdeaComment } from '@/lib/types'

interface CommentSectionProps {
  ideaId: string
}

interface CommentProps {
  comment: any
  replies: any[]
  onReply: (parentId: string) => void
  onUpvote: (commentId: string) => void
  replyingTo: string | null
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: (parentId: string) => void
  user: { id: string } | null
}

export default function CommentSection({ ideaId }: CommentSectionProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [allComments, setAllComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [mainComment, setMainComment] = useState('')

  const fetchComments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('idea_comments')
      .select('*, author:profiles(username)')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching comments:', error.message)
    } else if (data) {
      setAllComments(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()
  }, [ideaId])

  const topLevelComments = allComments.filter(c => !c.parent_id)
  const replies = allComments.filter(c => c.parent_id)

  const handleMainSubmit = async () => {
    if (!user || !mainComment.trim()) return

    const { error } = await supabase.from('idea_comments').insert({
      idea_id: ideaId,
      content: mainComment.trim(),
      author_id: user.id,
      parent_id: null,
      upvotes: 0,
      created_at: new Date().toISOString()
    })

    if (error) {
      alert('Error sharing comment: ' + error.message)
    } else {
      setMainComment('')
      fetchComments()
    }
  }

  const handleReply = (parentId: string) => {
    if (!user) return
    setReplyingTo(replyingTo === parentId ? null : parentId)
    setReplyContent('')
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    const { error } = await supabase.from('idea_comments').insert({
      idea_id: ideaId,
      content: replyContent.trim(),
      author_id: user.id,
      parent_id: parentId,
      upvotes: 0,
      created_at: new Date().toISOString()
    })

    if (error) {
      alert('Error replying: ' + error.message)
    } else {
      setReplyContent('')
      setReplyingTo(null)
      fetchComments()
    }
  }

  const handleUpvote = async (commentId: string) => {
    if (!user) return
    const target = allComments.find(c => c.id === commentId)
    const newUpvotes = (target?.upvotes || 0) + 1
    
    const { error } = await supabase
      .from('idea_comments')
      .update({ upvotes: newUpvotes })
      .eq('id', commentId)

    if (!error) {
      setAllComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, upvotes: newUpvotes } : c
      ))
    }
  }

  if (loading) {
    return <p className="text-xs text-[var(--muted)]">{'>'} loading comments...</p>
  }

  return (
    <div>
      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">
        Discussion ({allComments.length})
      </p>

      {user && (
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={mainComment}
              onChange={(e) => setMainComment(e.target.value)}
              placeholder="Share your thoughts or suggestions..."
              className="input flex-1"
            />
            <button
              onClick={handleMainSubmit}
              disabled={!mainComment.trim()}
              className="btn-primary whitespace-nowrap"
            >
              [post]
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            replies={replies.filter(r => r.parent_id === comment.id)}
            onReply={handleReply}
            onUpvote={handleUpvote}
            replyingTo={replyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmitReply={handleReplySubmit}
            user={user}
          />
        ))}
      </div>

      {topLevelComments.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  )
}

function Comment({
  comment,
  replies,
  onReply,
  onUpvote,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  user
}: CommentProps) {
  const handleUpvote = () => {
    if (!user) return
    onUpvote(comment.id)
  }

  return (
    <div className="border-b border-[var(--border)] pb-4 last:border-0">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded bg-[var(--foreground)]/10 border border-[var(--border)] flex items-center justify-center">
          <span className="text-xs font-bold text-[var(--foreground-dim)]">
            {comment.author?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-[var(--foreground)]">
              @{comment.author?.username || 'anonymous'}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {new Date(comment.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          </div>
          <p className="text-sm text-[var(--foreground-dim)] mb-2">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpvote}
              disabled={!user}
              className={`flex items-center gap-1 text-xs transition-colors ${
                user ? 'text-[var(--muted)] hover:text-[var(--foreground-dim)]' : 'text-[var(--muted)] cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {comment.upvotes || 0}
            </button>
            {user && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-[var(--muted)] hover:text-[var(--foreground-dim)] transition-colors"
              >
                [reply]
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="input text-sm flex-1"
                autoFocus
              />
              <button
                onClick={() => onSubmitReply(comment.id)}
                className="btn-primary text-sm py-1.5 px-3"
              >
                [reply]
              </button>
              <button
                onClick={() => onReply('')}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                [cancel]
              </button>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-3 ml-4 sm:ml-6 border-l-2 border-[var(--border)] pl-3 sm:pl-4 space-y-3">
              {replies.map((reply) => {
                return (
                  <div key={reply.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[var(--foreground)] text-xs sm:text-sm">
                        @{reply.author?.username || 'anonymous'}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-[var(--foreground-dim)] text-xs sm:text-sm">
                      {reply.content}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
