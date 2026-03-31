'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ themeColor: '#2563eb', refreshTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState('#2563eb')

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/settings/profile')
      if (res.ok) {
        const data = await res.json()
        if (data?.themeColor) {
          setThemeColor(data.themeColor)
          document.documentElement.style.setProperty('--primary-color', data.themeColor)

          // Generate a lighter version for backgrounds if possible,
          // but for now, we'll just set the main variable.
          // We can also compute darker/lighter versions here if needed.
        }
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err)
    }
  }

  useEffect(() => {
    fetchTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ themeColor, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
