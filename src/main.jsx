import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { GOOGLE_CLIENT_ID } from './lib/auth.js'

const rootEl = document.getElementById('root')
if (rootEl) rootEl.setAttribute('data-theme', 'light')

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

createRoot(rootEl).render(
  GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
  ) : (
    app
  ),
)
