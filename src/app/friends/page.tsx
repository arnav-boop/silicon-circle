'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface DirectMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export default function FriendsPage() {
  const { user, loading, friends, friendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !activeChat) return
    
    const loadDMs = async () => {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data as DirectMessage[])
    }
    loadDMs()

    const channel = supabase.channel(`dm:${activeChat.id}`)
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' },
      (p: any) => {
        const msg = p.new as DirectMessage
        if ((msg.sender_id === user.id && msg.receiver_id === activeChat.id) ||
            (msg.receiver_id === user.id && msg.sender_id === activeChat.id)) {
          setMessages(prev => [...prev, msg])
        }
      }
    ).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, activeChat])

  const handleSearch = async () => {
    if (!searchUsername.trim()) return
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', searchUsername)
      .single()
    setSearchResult(data || null)
    setSearching(false)
  }

  const handleSendFriendRequest = async () => {
    const { error } = await sendFriendRequest(searchUsername)
    if (error) {
      alert(error.message)
    } else {
      alert('Friend request sent!')
      setSearchResult(null)
      setSearchUsername('')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat) return
    
    await supabase.from('direct_messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.id,
      content: newMessage
    })
    
    setMessages(prev => [...prev, {
      id: String(Date.now()),
      sender_id: user.id,
      receiver_id: activeChat.id,
      content: newMessage,
      created_at: new Date().toISOString()
    } as DirectMessage])
    setNewMessage('')
  }

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen"><p className="glow">{'>'} loading...</p></div>
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs text-[var(--muted)] mb-1">{'>'} friends_module</p>
        <h1 className="text-2xl sm:text-3xl font-bold glow">Friends_</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: Friends list & requests */}
        <div className="space-y-4">
          {/* Add friend */}
          <div className="card p-4">
            <h3 className="font-bold mb-2 glow-subtle">Add Friend</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Enter username..."
                className="input text-sm flex-1"
              />
              <button onClick={handleSearch} className="btn-primary text-sm">
                Search
              </button>
            </div>
            {searchResult && (
              <div className="mt-3 p-2 border border-[var(--border)] rounded">
                <p className="text-sm">Found: <span className="text-[var(--accent)] font-bold">@{searchResult.username}</span></p>
                <button onClick={handleSendFriendRequest} className="btn-secondary text-sm mt-2 w-full">
                  [ Send Friend Request ]
                </button>
              </div>
            )}
          </div>

          {/* Friend requests */}
          {friendRequests.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold mb-2 glow-subtle text-[var(--accent)]">Friend Requests</h3>
              {friendRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                  <span>@{req.username}</span>
                  <div className="flex gap-2">
                    <button onClick={() => acceptFriendRequest(req.id)} className="btn-primary text-xs py-1 px-2">Accept</button>
                    <button onClick={() => rejectFriendRequest(req.id)} className="btn-secondary text-xs py-1 px-2">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends list */}
          <div className="card p-4">
            <h3 className="font-bold mb-2 glow-subtle">Your Friends ({friends.length})</h3>
            {friends.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No friends yet. Add some!</p>
            ) : (
              friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => setActiveChat(friend)}
                  className={`w-full text-left py-2 border-b border-[var(--border)] hover:bg-[var(--border)] ${activeChat?.id === friend.id ? 'bg-[var(--border)]' : ''}`}
                >
                  @{friend.username}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: DM Chat */}
        <div className="card p-4">
          {activeChat ? (
            <>
              <h3 className="font-bold mb-3 glow-subtle">Chat with @{activeChat.username}</h3>
              <div className="h-64 overflow-y-auto space-y-2 mb-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No messages yet. Say hi!</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`text-sm ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}>
                      <span className="text-[var(--muted)]">[{new Date(msg.created_at).toLocaleTimeString()}]</span>
                      <span className={msg.sender_id === user.id ? 'text-[var(--accent)]' : 'text-[var(--foreground-dim)]'}>
                        {' '}{msg.content}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="input text-sm flex-1"
                />
                <button onClick={handleSendMessage} className="btn-primary text-sm">[Send]</button>
              </div>
            </>
          ) : (
            <p className="text-center text-[var(--muted)] py-8">Select a friend to start chatting</p>
          )}
        </div>
      </div>
    </div>
  )
}