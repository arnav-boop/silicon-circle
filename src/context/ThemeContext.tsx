'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, themes, defaultTheme } from '@/lib/themes'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  config: typeof themes[Theme]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const stored = localStorage.getItem('silicon-circle-theme') as Theme
    if (stored && themes[stored]) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    const config = themes[theme]
    const root = document.documentElement
    
    Object.entries(config.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssKey}`, value)
    })
    
    root.style.setProperty('--font-mono', config.font)
    root.style.setProperty('--font-sans', config.font)
    root.className = config.cssClass
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('silicon-circle-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
