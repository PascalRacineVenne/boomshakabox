import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setTheme } from '@cutoff/audio-ui-react'
import '@cutoff/audio-ui-react/style.css'
import './index.css'
import App from './App.tsx'

// Set once at app root, before any control renders — reuses the project's
// existing --accent variable so audio/ui components match the rest of the UI
// rather than introducing a second color source.
setTheme({ color: 'var(--accent)', roundness: 0.3 })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
