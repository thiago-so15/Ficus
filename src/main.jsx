import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { STORAGE_APP_INSTALL_AT, STORAGE_USER_PREFERENCES } from './data/storageKeys'
import { DEFAULT_USER_PREFERENCES, normalizeUserPreferences } from './data/userPreferences'
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

try {
  if (!localStorage.getItem(STORAGE_APP_INSTALL_AT)) {
    localStorage.setItem(STORAGE_APP_INSTALL_AT, new Date().toISOString())
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
