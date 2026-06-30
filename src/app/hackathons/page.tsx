'use client'

import { Hackathon } from '@/lib/types'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'

export default function HackathonsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHackathons = async () => {
    setLoading(true)
    const { data: hackathonData, error: hError } = await supabase
      .from('hackathons')
      .select('*')
      .order('date', { ascending: true })

    if (hError) {
      console.error('Error fetching hackathons:', hError.message)
      setLoading(false)
      return
    }

    let joinedList: string[] = []
    if (user) {
      const { data: participationData, error: pError } = await supabase
        .from('hackathon_participants')
        .select('hackathon_id')
        .eq('user_id', user.id)

      if (!pError && participationData) {
        joinedList = participationData.map(p => p.hackathon_id)
      }
    }

    if (hackathonData) {
      const list = hackathonData.map((h: any) => ({
        ...h,
        joined: joinedList.includes(h.id),
        participants: h.participants || 0
      }))
      setHackathons(list)
      setJoinedIds(joinedList)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHackathons()
  }, [user])

  const toggleJoin = async (hackathonId: string, currentJoined: boolean) => {
    if (!user) {
      alert('Please log in to join hackathons.')
      return
    }

    if (currentJoined) {
      // Leave hackathon
      const { error } = await supabase
        .from('hackathon_participants')
        .delete()
        .eq('hackathon_id', hackathonId)
        .eq('user_id', user.id)

      if (error) {
        alert('Error leaving: ' + error.message)
      } else {
        // Decrement participants count in hackathons table
        const target = hackathons.find(h => h.id === hackathonId)
        const newCount = Math.max(0, (target?.participants || 1) - 1)
        await supabase.from('hackathons').update({ participants: newCount }).eq('id', hackathonId)
        
        setJoinedIds(prev => prev.filter(id => id !== hackathonId))
        setHackathons(prev => prev.map(h => 
          h.id === hackathonId ? { ...h, joined: false, participants: newCount } : h
        ))
      }
    } else {
      // Join hackathon
      const { error } = await supabase
        .from('hackathon_participants')
        .insert({
          hackathon_id: hackathonId,
          user_id: user.id
        })

      if (error) {
        alert('Error joining: ' + error.message)
      } else {
        // Increment participants count in hackathons table
        const target = hackathons.find(h => h.id === hackathonId)
        const newCount = (target?.participants || 0) + 1
        await supabase.from('hackathons').update({ participants: newCount }).eq('id', hackathonId)

        setJoinedIds(prev => [...prev, hackathonId])
        setHackathons(prev => prev.map(h => 
          h.id === hackathonId ? { ...h, joined: true, participants: newCount } : h
        ))
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">{'>'} hackathon_module</p>
          <h1 className="text-2xl sm:text-3xl font-bold glow">Hackathons_</h1>
        </div>
        {user && (
          <Link href="/hackathons/host" className="btn-primary text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6">
            [+ host hackathon]
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-[var(--muted)]">{'>'} loading hackathons...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hackathons.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No hackathons listed yet.</p>
          ) : (
            hackathons.map((hackathon) => (
              <div key={hackathon.id} className="card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h2 className="text-base sm:text-lg font-bold mb-1 glow-subtle">
                      {hackathon.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--foreground-dim)] mb-2 sm:mb-3">{hackathon.description}</p>
                    <div className="flex items-center gap-4 sm:gap-6 text-xs text-[var(--muted)]">
                      <span>{hackathon.date}</span>
                      <span>{hackathon.participants} participants</span>
                    </div>
                  </div>
                  {user && (
                    <button
                      onClick={() => toggleJoin(hackathon.id, !!hackathon.joined)}
                      className={`${hackathon.joined ? 'btn-secondary' : 'btn-primary'} text-sm py-2 px-4 w-full sm:w-auto`}
                    >
                      {hackathon.joined ? '[leave]' : '[join]'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}