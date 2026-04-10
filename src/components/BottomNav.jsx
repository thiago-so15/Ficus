/**
 * @param {{
 *   active: 'albums' | 'stores' | 'settings' | 'profile'
 *   onChange: (t: 'albums' | 'stores' | 'settings' | 'profile') => void
 *   disabled?: boolean
 *   showPrintAction?: boolean
 *   onPrintAction?: () => void
 * }} props
 */
export function BottomNav({
  active,
  onChange,
  disabled = false,
  showPrintAction = false,
  onPrintAction = undefined,
}) {
  return (
    <nav className={`bottom-nav ${showPrintAction ? 'bottom-nav--five' : 'bottom-nav--four'}`} aria-label="Navegación principal">
      {showPrintAction && (
        <button type="button" className="bottom-nav__item bottom-nav__item--print" onClick={onPrintAction} disabled={disabled}>
          <span className="bottom-nav__icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3h10v4H7V3zm10 14H7v4h10v-4zm2-9H5a2 2 0 0 0-2 2v6h4v-3h10v3h4v-6a2 2 0 0 0-2-2z"
                fill="currentColor"
              />
            </svg>
          </span>
          Imprimir
        </button>
      )}
      <button
        type="button"
        className={`bottom-nav__item ${active === 'albums' ? 'bottom-nav__item--active' : ''}`}
        onClick={() => onChange('albums')}
        disabled={disabled}
        aria-current={active === 'albums' ? 'page' : undefined}
      >
        <span className="bottom-nav__icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z"
              fill="currentColor"
            />
          </svg>
        </span>
        Álbumes
      </button>
      <button
        type="button"
        className={`bottom-nav__item ${active === 'stores' ? 'bottom-nav__item--active' : ''}`}
        onClick={() => onChange('stores')}
        disabled={disabled}
        aria-current={active === 'stores' ? 'page' : undefined}
      >
        <span className="bottom-nav__icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 21h18v-2H3v2zM5 7h2v10H5V7zm4 0h2v10H9V7zm4-4h2v14h-2V3zm4 4h2v10h-2V7z"
              fill="currentColor"
            />
          </svg>
        </span>
        Tiendas
      </button>
      <button
        type="button"
        className={`bottom-nav__item ${active === 'settings' ? 'bottom-nav__item--active' : ''}`}
        onClick={() => onChange('settings')}
        disabled={disabled}
        aria-current={active === 'settings' ? 'page' : undefined}
      >
        <span className="bottom-nav__icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M10.62 2h2.76l.39 2.22a7.96 7.96 0 0 1 1.89.78l1.96-1.15 1.95 1.95-1.15 1.96c.3.6.56 1.23.77 1.89L22 10.62v2.76l-2.22.39c-.21.66-.47 1.29-.78 1.89l1.15 1.96-1.95 1.95-1.96-1.15c-.6.3-1.23.56-1.89.77L13.38 22h-2.76l-.39-2.22a7.96 7.96 0 0 1-1.89-.78l-1.96 1.15-1.95-1.95 1.15-1.96a7.96 7.96 0 0 1-.77-1.89L2 13.38v-2.76l2.22-.39c.21-.66.47-1.29.78-1.89L3.85 6.38l1.95-1.95 1.96 1.15c.6-.3 1.23-.56 1.89-.77L10.62 2ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
              fill="currentColor"
            />
          </svg>
        </span>
        Ajustes
      </button>
      <button
        type="button"
        className={`bottom-nav__item ${active === 'profile' ? 'bottom-nav__item--active' : ''}`}
        onClick={() => onChange('profile')}
        disabled={disabled}
        aria-current={active === 'profile' ? 'page' : undefined}
      >
        <span className="bottom-nav__icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"
              fill="currentColor"
            />
          </svg>
        </span>
        Perfil
      </button>
    </nav>
  )
}
