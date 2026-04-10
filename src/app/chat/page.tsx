'use client'

import { useState, useRef, useEffect } from 'react'
import { mockChannels, Message } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ChatPage() {
  const { user, loading: authLoading, username } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [activeChannel, setActiveChannel] = useState(mockChannels[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showChannels, setShowChannels] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [viewingReply, setViewingReply] = useState<Message | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Load messages error:', error.message)
      }
      if (data) setMessages(data as Message[])
    }
    loadMessages()

    const channel = supabase.channel(`chat:${activeChannel.id}`)
    
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` },
      (p) => {
        console.log('Real-time: New message received', p.new)
        setMessages(prev => {
          if (prev.some(m => m.id === p.new.id)) return prev
          return [...prev, p.new as Message]
        })
      }
    )
    
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` },
      (p) => {
        console.log('Real-time: Message updated', p.new)
        setMessages(prev => prev.map(m => m.id === p.new.id ? p.new as Message : m))
      }
    )
    
    channel.subscribe((status) => {
      console.log('Subscription status:', status)
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to channel:', `chat:${activeChannel.id}`)
      }
    })
    
    // Poll every 3 seconds as fallback for real-time
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true })
      if (data) {
        setMessages(data as Message[])
      }
    }, 3000)
    
    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [user, activeChannel.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return
    
    const msgContent = newMessage
    const msgUsername = username || user.email?.split('@')[0] || 'user'
    const msgReplyToId = replyingTo?.id || null
    const msgReplyToContent = replyingTo?.content || null
    
    setNewMessage('')
    setReplyingTo(null)
    
    const { error } = await supabase.from('messages').insert({
      channel_id: activeChannel.id,
      content: msgContent,
      sender_id: user.id,
      sender_email: user.email,
      sender_username: msgUsername,
      reply_to_id: msgReplyToId,
      reply_to_content: msgReplyToContent,
      created_at: new Date().toISOString()
    })
    
    if (error) {
      console.error('Failed to send message:', error.message)
      alert('Failed to send: ' + error.message)
      return
    }
    
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      channel_id: activeChannel.id,
      content: msgContent,
      sender_id: user.id,
      sender_email: user.email,
      sender_username: msgUsername,
      reply_to_id: msgReplyToId,
      reply_to_content: msgReplyToContent,
      created_at: new Date().toISOString()
    } as Message])
  }

  const handleUpvote = async (msgId: string) => {
    if (!user) return
    const { data: existing } = await supabase
      .from('message_upvotes')
      .select('*')
      .eq('message_id', msgId)
      .eq('user_id', user.id)
      .single()
    
    if (existing) {
      await supabase.from('message_upvotes').delete().eq('id', existing.id)
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, upvote_count: Math.max(0, (m.upvote_count || 1) - 1) } : m))
    } else {
      await supabase.from('message_upvotes').insert({ message_id: msgId, user_id: user.id })
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, upvote_count: (m.upvote_count || 0) + 1 } : m))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    const reader = new FileReader()
    reader.onload = async () => {
      const msg = {
        channel_id: activeChannel.id,
        content: `[📎 Attachment: ${file.name}]`,
        sender_id: user.id,
        sender_email: user.email,
        sender_username: username || user.email?.split('@')[0] || 'user',
        attachment_url: file.name,
        created_at: new Date().toISOString()
      }
      await supabase.from('messages').insert(msg)
      setMessages(prev => [...prev, { ...msg, id: String(Date.now()) } as Message])
    }
    reader.readAsDataURL(file)
  }

  const groupedChannels = mockChannels.reduce((acc, channel) => {
    if (!acc[channel.category]) acc[channel.category] = []
    acc[channel.category].push(channel)
    return acc
  }, {} as Record<string, typeof mockChannels>)

  if (authLoading || !user) return <div className="flex items-center justify-center min-h-screen"><p className="glow">{'>'} checking auth...</p></div>

  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-60px)] relative">
      {/* Mobile hamburger menu toggle */}
      <button 
        className="sm:hidden absolute top-3 left-3 z-20 p-2 rounded border border-[var(--border)]"
        onClick={() => setShowChannels(!showChannels)}
        style={{ color: 'var(--foreground)', backgroundColor: 'var(--card-bg)' }}
      >
        {showChannels ? '✕' : '☰'}
      </button>

      <div className="sm:hidden h-12"></div>

      {/* Channels sidebar */}
      <aside className={`${showChannels ? 'flex' : 'hidden'} sm:flex w-full sm:w-56 border-r border-[var(--border)] bg-[var(--card-bg)] overflow-y-auto`}>
        <div className="p-3 sm:p-4 w-full">
          <p className="text-xs text-[var(--muted)] mb-3">{'>'} channels</p>
          {Object.entries(groupedChannels).map(([category, channels]) => (
            <div key={category} className="mb-3 sm:mb-4">
              <h3 className="text-xs text-[var(--muted)] mb-1 uppercase">{category}</h3>
              {channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => { setActiveChannel(channel); setShowChannels(false) }}
                  className={`w-full text-left p-1.5 text-sm ${activeChannel.id === channel.id ? 'text-[var(--foreground)] glow-subtle' : 'text-[var(--foreground-dim)] hover:text-[var(--foreground)]'}`}
                >
                  # {channel.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        <header className="p-2 sm:p-3 border-b border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">{'//'} chat_module</p>
          <h2 className="text-base sm:text-lg font-bold"><span className="glow"># {activeChannel.name}</span></h2>
          {activeChannel.topic && <p className="text-xs text-[var(--muted)] hidden sm:block">{activeChannel.topic}</p>}
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No messages yet. Start the conversation!</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="border border-[var(--border)] rounded p-2 sm:p-3">
                {msg.reply_to_id && (
                  <button 
                    onClick={() => {
                      const originalMsg = messages.find(m => m.id === msg.reply_to_id)
                      if (originalMsg) setViewingReply(originalMsg)
                    }}
                    className="text-xs text-[var(--accent)] mb-1 pl-2 border-l-2 border-[var(--accent)] hover:underline text-left"
                  >
                    ↩ Replying to: {msg.reply_to_content?.slice(0, 50)}...
                  </button>
                )}
                <div className="flex items-start gap-2">
                  <button 
                    onClick={() => handleUpvote(msg.id)}
                    className="text-sm flex flex-col items-center min-w-[40px]"
                  >
                    <span>▲</span>
                    <span className="text-xs">{msg.upvote_count || 0}</span>
                  </button>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="text-[var(--muted)]">[{new Date(msg.created_at).toLocaleTimeString()}]</span>
                      <span className="text-[var(--accent)] font-bold mx-1">{msg.sender_username || msg.sender_email?.split('@')[0] || 'user'}</span>
                    </div>
                    <div className="text-[var(--foreground)]">{msg.content}</div>
                    {msg.attachment_url && <div className="text-xs text-[var(--accent)] mt-1">📎 {msg.attachment_url}</div>}
                    <button 
                      onClick={() => setReplyingTo(msg)}
                      className="text-xs text-[var(--muted)] mt-1 hover:text-[var(--foreground)]"
                    >
                      ↩ reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="p-2 sm:p-3 border-t border-[var(--border)]">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 p-2 bg-[var(--card-bg)] rounded">
              <span>↩ Replying to: {replyingTo.content.slice(0, 30)}...</span>
              <button onClick={() => setReplyingTo(null)}>✕</button>
            </div>
          )}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm py-2 px-3"
              title="Attach file"
            >
              📎
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message as ${username || user?.email?.split('@')[0]}...`}
              className="input text-sm py-2 flex-1 min-w-[150px]"
            />
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="btn-secondary text-sm py-2 px-3">😊</button>
            <button onClick={handleSendMessage} className="btn-primary text-sm py-2 px-3 sm:px-4">
              [send]
            </button>
          </div>
          {showEmojiPicker && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀'].map(emoji => (
                <button 

                  key={emoji}
                  onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false) }}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply viewing modal */}
        {viewingReply && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingReply(null)}>
            <div className="card p-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold glow">Original Message</h3>
                <button onClick={() => setViewingReply(null)} className="text-xl">✕</button>
              </div>
              <div className="text-sm mb-2">
                <span className="text-[var(--muted)]">[{new Date(viewingReply.created_at).toLocaleTimeString()}]</span>
                <span className="text-[var(--accent)] font-bold ml-2">{viewingReply.sender_username}</span>
              </div>
              <div className="text-[var(--foreground)]">{viewingReply.content}</div>
              <button 
                onClick={() => { setReplyingTo(viewingReply); setViewingReply(null) }}
                className="btn-secondary text-sm mt-4 w-full"
              >
                [ Reply to this ]
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}