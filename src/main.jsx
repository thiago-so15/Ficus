import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DEFAULT_USER_PREFERENCES, normalizeUserPreferences } from './data/userPreferences'
import { STORAGE_USER_PREFERENCES } from './data/storageKeys'
import './index.css'
import App from './App.jsx'

try {
  const raw = localStorage.getItem(STORAGE_USER_PREFERENCES)
  const prefs = normalizeUserPreferences(raw ? JSON.parse(raw) : null)
  document.documentElement.dataset.theme = prefs.theme
  document.documentElement.lang = prefs.locale
  document.documentElement.style.colorScheme = prefs.theme === 'dark' ? 'dark' : 'light'
} catch {
  document.documentElement.dataset.theme = DEFAULT_USER_PREFERENCES.theme
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
