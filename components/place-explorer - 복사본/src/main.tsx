import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// HashRouter (routes as /#/places/GH01), not BrowserRouter — this app is
// also shipped as a single static HTML file (no server to fall back to
// index.html for unknown paths), and hash-based routes work identically
// whether it's served by `npm run dev`, hosted as a static build, or
// opened directly as a file. If this ever moves behind a real server
// with proper SPA rewrite rules configured, swap this for BrowserRouter
// for cleaner URLs.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
