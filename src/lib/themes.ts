export type Theme = '80s' | '90s' | '2000s' | '2010s' | '2020s' | 'frutiger'

export interface ThemeConfig {
  id: Theme
  name: string
  colors: {
    background: string
    foreground: string
    foregroundDim: string
    cardBg: string
    border: string
    muted: string
    accent: string
  }
  font: string
  cssClass: string
}

export const themes: Record<Theme, ThemeConfig> = {
  '80s': {
    id: '80s',
    name: '80s Terminal',
    colors: {
      background: '#000000',
      foreground: '#00ff41',
      foregroundDim: '#00aa2c',
      cardBg: '#0a0a0a',
      border: '#003b00',
      muted: '#006600',
      accent: '#00ff41',
    },
    font: 'VT323',
    cssClass: 'theme-80s',
  },
  '90s': {
    id: '90s',
    name: 'Windows 95',
    colors: {
      background: '#008080',
      foreground: '#000000',
      foregroundDim: '#000000',
      cardBg: '#c0c0c0',
      border: '#808080',
      muted: '#808080',
      accent: '#000080',
    },
    font: 'MS Sans Serif, Tahoma, sans-serif',
    cssClass: 'theme-90s',
  },
  '2000s': {
    id: '2000s',
    name: 'Windows XP',
    colors: {
      background: '#003399',
      foreground: '#ffffff',
      foregroundDim: '#cccccc',
      cardBg: '#1a1a1a',
      border: '#3399cc',
      muted: '#66ccff',
      accent: '#ff6600',
    },
    font: 'Tahoma, sans-serif',
    cssClass: 'theme-2000s',
  },
  '2010s': {
    id: '2010s',
    name: 'Flat/iOS',
    colors: {
      background: '#f5f5f7',
      foreground: '#1d1d1f',
      foregroundDim: '#86868b',
      cardBg: '#ffffff',
      border: '#d2d2d7',
      muted: '#aeaeb2',
      accent: '#0071e3',
    },
    font: '-apple-system, BlinkMacSystemFont, sans-serif',
    cssClass: 'theme-2010s',
  },
  '2020s': {
    id: '2020s',
    name: 'Modern Dark',
    colors: {
      background: '#0a0a0a',
      foreground: '#ffffff',
      foregroundDim: '#a1a1a6',
      cardBg: '#1c1c1e',
      border: '#38383a',
      muted: '#636366',
      accent: '#30d158',
    },
    font: '-apple-system, BlinkMacSystemFont, sans-serif',
    cssClass: 'theme-2020s',
  },
  'frutiger': {
    id: 'frutiger',
    name: 'Frutiger Aero',
    colors: {
      background: '#1a1a2e',
      foreground: '#ffffff',
      foregroundDim: '#b8c5d6',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(0, 168, 255, 0.3)',
      muted: '#6b7c93',
      accent: '#00a8e8',
    },
    font: 'Segoe UI, Tahoma, sans-serif',
    cssClass: 'theme-frutiger',
  },
}

export const defaultTheme: Theme = '80s'
