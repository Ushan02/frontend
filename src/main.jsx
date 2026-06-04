import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')
if (rootEl) rootEl.setAttribute('data-theme', 'light')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
