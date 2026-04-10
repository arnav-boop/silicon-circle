'use client'

import { useTheme } from '@/context/ThemeContext'
import { useEffect, useState } from 'react'

export default function ThemeLoader() {
  const { theme } = useTheme()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer)
          setTimeout(() => setVisible(false), 300)
          return 100
        }
        return p + Math.random() * 15
      })
    }, 150)
    return () => clearInterval(timer)
  }, [])

  if (!visible) return null

  const animations = {
    '80s': <Loader80s progress={progress} />,
    '90s': <Loader90s progress={progress} />,
    '2000s': <Loader2000s progress={progress} />,
    '2010s': <Loader2010s progress={progress} />,
    '2020s': <Loader2020s progress={progress} />,
    'frutiger': <LoaderFrutiger progress={progress} />,
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md" style={{ fontSize: '16px' }}>
        {animations[theme as keyof typeof animations]}
      </div>
    </div>
  )
}

function Loader80s({ progress }: { progress: number }) {
  return (
    <div className="text-center">
      <pre className="text-[10px] sm:text-xs mb-3 sm:mb-4 text-[var(--foreground)] overflow-x-auto" style={{ color: 'var(--foreground)' }}>
{` ____  ____  ____  ____ 
(___)(___)(___)(___)
(__) SILICON CIRCLE (__)
(__)(___)(___)(___)
(___)(___)(___)(___)`}</pre>
      <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--foreground)' }}>
        {progress < 30 ? '> initializing...' : 
         progress < 60 ? '> loading modules...' :
         progress < 90 ? '> checking connection...' :
         '> system ready_'}
      </p>
      <div className="w-full max-w-xs h-3 sm:h-4 border border-[var(--foreground)] mx-auto" style={{ borderColor: 'var(--border)' }}>
        <div className="h-full transition-all duration-200" style={{ 
          width: `${Math.min(progress, 100)}%`, 
          background: 'var(--foreground)' 
        }} />
      </div>
      <p className="text-[10px] sm:text-xs mt-2" style={{ color: 'var(--muted)' }}>{Math.round(progress)}%</p>
    </div>
  )
}

function Loader90s({ progress }: { progress: number }) {
  const blocks = Math.floor(progress / 10)
  return (
    <div className="text-center" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      <div className="bg-[#c0c0c0] p-2 rounded-sm w-full" style={{ background: 'var(--card-bg)' }}>
        <div className="bg-[#000080] text-white px-3 py-1 text-xs sm:text-sm font-bold mb-2" style={{ background: 'var(--accent)' }}>
          Silicon Circle
        </div>
        <div className="bg-[#c0c0c0] p-3 rounded-sm" style={{ background: 'var(--card-bg)' }}>
          <p className="text-black text-xs sm:text-sm mb-2">Loading...</p>
          <div className="grid grid-cols-10 gap-1 mb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-3 sm:h-4 bg-[#808080]" style={{ 
                background: i <= blocks ? 'var(--foreground)' : 'var(--border)',
                opacity: i <= blocks ? 1 : 0.3
              }} />
            ))}
          </div>
          <p className="text-black text-[10px] sm:text-xs">Please wait...</p>
        </div>
      </div>
    </div>
  )
}

function Loader2000s({ progress }: { progress: number }) {
  return (
    <div className="text-center" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      <div className="w-full p-3 sm:p-4 rounded-lg" style={{ background: 'var(--cardBg)' }}>
        <div className="text-white text-xs sm:text-sm mb-3 font-bold">Loading</div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ 
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, #3399cc, #66ccff)'
          }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] sm:text-xs" style={{ color: 'var(--foreground)' }}>
          <span>{Math.round(progress)}%</span>
          <span>Loading resources...</span>
        </div>
      </div>
      <div className="flex gap-1 mt-3 sm:mt-4 justify-center">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className="w-2 h-2 rounded-full"
            style={{ 
              background: 'var(--accent)',
              animation: `bounce 1s ${i * 0.15}s infinite`
            }} 
          />
        ))}
      </div>
    </div>
  )
}

function Loader2010s({ progress }: { progress: number }) {
  return (
    <div className="text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 mx-auto">
        <svg viewBox="0 0 50 50" className="animate-spin">
          <circle cx="25" cy="25" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent)" strokeWidth="4" 
            strokeDasharray="31.4 88.8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-xs sm:text-sm" style={{ color: 'var(--foreground)' }}>Loading...</p>
      <div className="flex gap-1 mt-2 justify-center">
        {[0, 1, 2].map(i => (
          <div 
            key={i} 
            className="w-1 h-1 rounded-full"
            style={{ 
              background: 'var(--accent)',
              animation: `pulse 1s ${i * 0.2}s infinite`
            }} 
          />
        ))}
      </div>
    </div>
  )
}

function Loader2020s({ progress }: { progress: number }) {
  return (
    <div className="text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div className="w-full max-w-xs mx-auto space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#30d158]" style={{ background: 'var(--accent)' }} />
          <div className="flex-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--border)' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#30d158]" style={{ background: 'var(--accent)' }} />
          <div className="flex-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--border)', animationDelay: '0.2s' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#30d158]" style={{ background: 'var(--accent)' }} />
          <div className="flex-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--border)', animationDelay: '0.4s' }} />
        </div>
      </div>
      <p className="text-[10px] sm:text-xs mt-3 sm:mt-4" style={{ color: 'var(--foregroundDim)' }}>
        {Math.round(progress)}%
      </p>
    </div>
  )
}

function LoaderFrutiger({ progress }: { progress: number }) {
  return (
    <div className="text-center" style={{ fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 sm:mb-4 mx-auto">
        <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, rgba(0,168,232,0.3), rgba(0,255,200,0.3))' }} />
        <div className="absolute inset-2 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, var(--accent), #00ffc8)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: 'rgba(255,255,255,0.8)' }} />
        </div>
      </div>
      <div className="w-full max-w-xs h-3 rounded-full overflow-hidden mx-auto" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ 
          width: `${Math.min(progress, 100)}%`,
          background: 'linear-gradient(90deg, #00a8e8, #00ffc8)'
        }} />
      </div>
      <p className="text-xs sm:text-sm mt-3" style={{ color: 'var(--foreground)' }}>
        Loading... {Math.round(progress)}%
      </p>
    </div>
  )
}
