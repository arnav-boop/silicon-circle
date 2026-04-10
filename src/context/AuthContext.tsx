'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  username: string | null
  friends: any[]
  friendRequests: any[]
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateUsername: (username: string) => Promise<{ error: Error | null }>
  sendFriendRequest: (friendUsername: string) => Promise<{ error: Error | null }>
  acceptFriendRequest: (requestId: string) => Promise<{ error: Error | null }>
  rejectFriendRequest: (requestId: string) => Promise<{ error: Error | null }>
  removeFriend: (friendId: string) => Promise<{ error: Error | null }>
  loadFriends: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const supabase = createClient()

  const loadFriends = async () => {
    if (!user) return
    
    // Get accepted friends
    const { data: friendsData } = await supabase
      .from('friends')
      .select('*, requester:profiles!requester_id(username), receiver:profiles!receiver_id(username)')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted')
    
    if (friendsData) {
      const formatted = friendsData.map(f => ({
        id: f.requester_id === user.id ? f.receiver_id : f.requester_id,
        username: f.requester_id === user.id ? f.receiver?.username : f.requester?.username
      }))
      setFriends(formatted)
    }

    // Get pending requests (where user is receiver)
    const { data: requestsData } = await supabase
      .from('friends')
      .select('*, requester:profiles!requester_id(username)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
    
    if (requestsData) {
      setFriendRequests(requestsData.map(r => ({
        id: r.id,
        from_user_id: r.requester_id,
        username: r.requester?.username
      })))
    }
  }

  const sendFriendRequest = async (friendUsername: string) => {
    if (!user) return { error: new Error('Not logged in') }
    
    // Find user by username
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', friendUsername)
      .single()
    
    if (!targetUser) return { error: new Error('User not found') }
    if (targetUser.id === user.id) return { error: new Error('Cannot add yourself') }

    // Check if already friends or request exists
    const { data: existing } = await supabase
      .from('friends')
      .select('id')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},receiver_id.eq.${user.id})`)
      .maybeSingle()
    
    if (existing) return { error: new Error('Friend request already exists') }

    const { error } = await supabase.from('friends').insert({
      requester_id: user.id,
      receiver_id: targetUser.id,
      status: 'pending'
    })
    
    return { error }
  }

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
    
    if (!error) loadFriends()
    return { error }
  }

  const rejectFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)
    
    if (!error) loadFriends()
    return { error }
  }

  const removeFriend = async (friendId: string) => {
    if (!user) return { error: new Error('Not logged in') }
    
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${user.id})`)
    
    if (!error) loadFriends()
    return { error }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
        if (profile) setUsername(profile.username)
      }
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (user) loadFriends()
  }, [user])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })
    if (!error && data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        email,
      })
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUsername(null)
  }

  const updateUsername = async (newUsername: string) => {
    if (!user) return { error: new Error('Not logged in') }
    
    // Update profile username
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', user.id)
    
    if (profileError) {
      return { error: profileError }
    }
    
    // Update all messages from this user
    await supabase
      .from('messages')
      .update({ sender_username: newUsername })
      .eq('sender_id', user.id)
    
    setUsername(newUsername)
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ 
      user, session, loading, username, 
      friends, friendRequests,
      signIn, signUp, signOut, updateUsername,
      sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, loadFriends 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}