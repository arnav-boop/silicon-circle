'use client'

import { useEffect, useState } from 'react'
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeLoader from "@/components/ThemeLoader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('silicon-circle-loaded')
    if (!hasLoaded) {
      setShowLoader(true)
      sessionStorage.setItem('silicon-circle-loaded', 'true')
    }
  }, [])

  return (
    <ThemeProvider>
      {showLoader && <ThemeLoader />}
      <div className="scanline" />
      <AuthProvider>
        <Navigation />
        <main className="flex-1">{children}</main>
      </AuthProvider>
    </ThemeProvider>
  )
}