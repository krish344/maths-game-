import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

async function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations()
    for (const reg of regs) {
      await reg.unregister()
    }
  }

  if (import.meta.env.PROD) {
    registerSW({ immediate: true })
  }
}

void setupServiceWorker()

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Missing #root mount node')
}

const root = createRoot(rootEl)

void import('./App.tsx')
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((err) => {
    console.error('Failed to load app shell:', err)
    root.render(
      <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <h2>Game failed to load</h2>
        <p>Try a hard refresh (Ctrl+Shift+R). If it still fails, restart dev server.</p>
      </div>,
    )
  })
