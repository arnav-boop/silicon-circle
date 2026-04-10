'use client'

import { useState, useRef, useEffect } from 'react'
import { mockChannels, mockMessages, Message } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeChannel, setActiveChannel] = useState(mockChannels[0])
  const [messages, setMessages] = useState<Message[]>(mockMessages[activeChannel.id] || [])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="glow">{'>'} checking auth...</p>
      </div>
    )
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const msg: Message = {
      id: String(Date.now()),
      channel_id: activeChannel.id,
      content: newMessage,
      sender_id: '1',
      created_at: new Date().toISOString()
    }
    
    setMessages([...messages, msg])
    setNewMessage('')
  }

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
                  onClick={() => {
                    setActiveChannel(channel)
                    setMessages(mockMessages[channel.id] || [])
                  }}
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
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="text-[var(--muted)]">[{new Date(msg.created_at).toLocaleTimeString()}]</span>
              <span className="text-[var(--foreground-dim)] mx-1">user:</span>
              <span className="text-[var(--foreground)]">{msg.content}</span>
            </div>
          ))}
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
              placeholder="type message..."
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