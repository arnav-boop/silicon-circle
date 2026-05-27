'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { IdeaComment } from '@/lib/types'
import Image from 'next/image'

interface CommentSectionProps {
  ideaId: string
  comments: IdeaComment[]
}

interface CommentProps {
  comment: IdeaComment
  replies: IdeaComment[]
  onReply: (parentId: string) => void
  onUpvote: (commentId: string) => void
  replyingTo: string | null
  replyContent: string
  setReplyContent: (content: string) => void
  replyAttachment: File | null
  setReplyAttachment: (file: File | null) => void
  onSubmitReply: (parentId: string) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  user: { id: string } | null
}

export default function CommentSection({ ideaId, comments }: CommentSectionProps) {
  const { user } = useAuth()
  const [allComments, setAllComments] = useState<IdeaComment[]>(comments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null)
  const [mainComment, setMainComment] = useState('')
  const [mainAttachment, setMainAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replyFileInputRef = useRef<HTMLInputElement>(null)

  const topLevelComments = allComments.filter(c => !c.parent_id)
  const replies = allComments.filter(c => c.parent_id)

  const handleMainSubmit = () => {
    if (!user || !mainComment.trim()) return

    const attachmentUrl = mainAttachment ? URL.createObjectURL(mainAttachment) : undefined

    const newComment: IdeaComment & { attachment_url?: string } = {
      id: `new-${Date.now()}`,
      idea_id: ideaId,
      content: mainComment,
      author_id: user.id,
      author: { id: user.id, username: user.user_metadata?.username || user.email?.split('@')[0] || 'user', created_at: new Date().toISOString() },
      parent_id: null,
      upvotes: 0,
      created_at: new Date().toISOString(),
      ...(attachmentUrl && { attachment_url: attachmentUrl })
    }

    setAllComments(prev => [newComment, ...prev])
    setMainComment('')
    setMainAttachment(null)
  }

  const handleReply = (parentId: string) => {
    if (!user) return
    setReplyingTo(replyingTo === parentId ? null : parentId)
    setReplyContent('')
    setReplyAttachment(null)
  }

  const handleReplySubmit = (parentId: string) => {
    if (!user || !replyContent.trim()) return

    const attachmentUrl = replyAttachment ? URL.createObjectURL(replyAttachment) : undefined

    const newComment: IdeaComment & { attachment_url?: string } = {
      id: `new-${Date.now()}`,
      idea_id: ideaId,
      content: replyContent,
      author_id: user.id,
      author: { id: user.id, username: user.user_metadata?.username || user.email?.split('@')[0] || 'user', created_at: new Date().toISOString() },
      parent_id: parentId,
      upvotes: 0,
      created_at: new Date().toISOString(),
      ...(attachmentUrl && { attachment_url: attachmentUrl })
    }

    setAllComments(prev => [...prev, newComment])
    setReplyContent('')
    setReplyAttachment(null)
    setReplyingTo(null)
  }

  const handleUpvote = (commentId: string) => {
    if (!user) return
    setAllComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
    ))
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setMainAttachment(e.target.files?.[0] || null)}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary py-2 px-3"
              title="Add image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleMainSubmit}
              disabled={!mainComment.trim()}
              className="btn-primary whitespace-nowrap"
            >
              [post]
            </button>
          </div>
          {mainAttachment && (
            <p className="text-xs text-[var(--muted)] mb-2">
              Image selected: {mainAttachment.name}
            </p>
          )}
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
            replyAttachment={replyAttachment}
            setReplyAttachment={setReplyAttachment}
            onSubmitReply={handleReplySubmit}
            fileInputRef={replyFileInputRef}
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
  replyAttachment,
  setReplyAttachment,
  onSubmitReply,
  fileInputRef,
  user
}: CommentProps) {
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes)

  const handleUpvote = () => {
    if (!user) return
    setLocalUpvotes(prev => prev + 1)
    onUpvote(comment.id)
  }

  const commentWithAttachment = comment as IdeaComment & { attachment_url?: string }

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
          {commentWithAttachment.attachment_url && (
            <div className="mb-2 border border-[var(--border)] rounded p-2 bg-[var(--card-bg)]/50 max-w-sm">
              <Image
                src={commentWithAttachment.attachment_url}
                alt="Attachment"
                width={200}
                height={200}
                className="max-w-full rounded"
                unoptimized
              />
            </div>
          )}
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
              {localUpvotes}
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setReplyAttachment(e.target.files?.[0] || null)}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary py-1.5 px-3"
                title="Add image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
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

          {replyAttachment && replyingTo === comment.id && (
            <p className="text-xs text-[var(--muted)] mt-2 mb-2">
              Image selected: {replyAttachment.name}
            </p>
          )}

          {replies.length > 0 && (
            <div className="mt-3 ml-4 sm:ml-6 border-l-2 border-[var(--border)] pl-3 sm:pl-4 space-y-3">
              {replies.map((reply) => {
                const replyWithAttachment = reply as IdeaComment & { attachment_url?: string }
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
                    {replyWithAttachment.attachment_url && (
                      <div className="mt-2 border border-[var(--border)] rounded p-2 bg-[var(--card-bg)]/50 max-w-sm">
                        <Image
                          src={replyWithAttachment.attachment_url}
                          alt="Attachment"
                          width={200}
                          height={200}
                          className="max-w-full rounded"
                          unoptimized
                        />
                      </div>
                    )}
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
