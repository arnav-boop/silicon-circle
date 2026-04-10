'use client'

import { useState, useRef, useEffect } from 'react'
import { mockChannels, Message } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [activeChannel, setActiveChannel] = useState(mockChannels[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const channelMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data as Message[])
      }
    }
    channelMessages()

    const subscription = supabase
      .channel(`chat:${activeChannel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, activeChannel.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return
    
    const msg = {
      channel_id: activeChannel.id,
      content: newMessage,
      sender_id: user.id,
      sender_email: user.email,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('messages').insert(msg)

    if (!error) {
      setNewMessage('')
    }
  }

  const username = user?.email?.split('@')[0] || 'user'

  const groupedChannels = mockChannels.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = []
    }
    acc[channel.category].push(channel)
    return acc
  }, {} as Record<string, typeof mockChannels>)

  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-60px)]">
      <aside className="w-full sm:w-56 border-r border-[var(--border)] bg-[var(--card-bg)] overflow-y-auto">
        <div className="p-3 sm:p-4">
          <p className="text-xs text-[var(--muted)] mb-3">{'>'} channels</p>
          
          {Object.entries(groupedChannels).map(([category, channels]) => (
            <div key={category} className="mb-3 sm:mb-4">
              <h3 className="text-xs text-[var(--muted)] mb-1 uppercase">{category}</h3>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full text-left p-1.5 text-sm ${
                    activeChannel.id === channel.id
                      ? 'text-[var(--foreground)] glow-subtle'
                      : 'text-[var(--foreground-dim)] hover:text-[var(--foreground)]'
                  }`}
                >
                  # {channel.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="p-2 sm:p-3 border-b border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">{'//'} chat_module</p>
          <h2 className="text-base sm:text-lg font-bold">
            <span className="glow"># {activeChannel.name}</span>
          </h2>
          {activeChannel.topic && (
            <p className="text-xs text-[var(--muted)] hidden sm:block">{activeChannel.topic}</p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="text-[var(--muted)]">[{new Date(msg.created_at).toLocaleTimeString()}]</span>
                <span className="text-[var(--foreground-dim)] mx-1">{msg.sender_email?.split('@')[0] || 'user'}:</span>
                <span className="text-[var(--foreground)]">{msg.content}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 sm:p-3 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <span className="text-[var(--foreground-dim)] self-center text-sm">{'>'}</span>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message as ${username}...`}
              className="input text-sm py-2"
            />
            <button onClick={handleSendMessage} className="btn-primary text-sm py-2 px-3 sm:px-4">
              [send]
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}