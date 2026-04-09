import { useMemo, useState } from 'react'
import packageJson from '../../package.json'
import { clearAllFicusLocalStorage, readAllFicusLocalStorage } from '../data/ficusStorage'

/** @typedef {import('../data/appSettings').AppSettings} AppSettings */
/** @typedef {import('../data/userPreferences').UserPreferences} UserPreferences */
/** @typedef {'es' | 'en' | 'pt'} Locale */

const COPY = /** @type {const} */ ({
  es: {
    title: 'Ajustes',
    appearance: 'Apariencia',
    theme: 'Tema',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
    notifications: 'Notificaciones',
    notifAlbum: 'Álbum casi completo',
    notifAlbumSub: 'Cuando superás el 90%',
    notifStores: 'Tiendas nuevas cerca',
    notifStoresSub: 'Cuando se agrega una tienda',
    langRegion: 'Idioma y región',
    language: 'Idioma',
    data: 'Datos',
    export: 'Exportar colección',
    exportSub: 'Guardar como archivo',
    wipe: 'Borrar todos los datos',
    wipeModalTitle: '¿Borrar todos los datos?',
    wipeModalBody:
      'Se van a eliminar álbumes, figuritas, perfil y ajustes de este dispositivo. Esta acción no se puede deshacer.',
    wipeConfirm: 'Borrar todo',
    wipeCancel: 'Cancelar',
    footer: 'Ficus · Hecho con amor para coleccionistas',
    langPickTitle: 'Idioma',
    advanced: 'Colección y tiendas',
    filterCountry: 'Filtrar tiendas por país',
    filterCountrySub: 'Según el país de tu perfil',
    confirmDel: 'Confirmar al eliminar álbum',
    confirmDelSub: 'Pedir confirmación antes de borrar',
    openFirst: 'Mostrar primero tiendas abiertas',
    openFirstSub: 'Ordenar la lista de Tiendas',
    showHint: 'Ayuda en tarjetas de tienda',
    showHintSub: 'Texto “Tocá para ver…”',
    largeText: 'Texto grande',
    largeTextSub: 'Interfaz más legible',
  },
  en: {
    title: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    notifications: 'Notifications',
    notifAlbum: 'Album almost complete',
    notifAlbumSub: 'When you pass 90%',
    notifStores: 'New stores nearby',
    notifStoresSub: 'When a store is added',
    langRegion: 'Language & region',
    language: 'Language',
    data: 'Data',
    export: 'Export collection',
    exportSub: 'Save as file',
    wipe: 'Delete all data',
    wipeModalTitle: 'Delete all data?',
    wipeModalBody:
      'Albums, stickers, profile and settings on this device will be removed. This cannot be undone.',
    wipeConfirm: 'Delete everything',
    wipeCancel: 'Cancel',
    footer: 'Ficus · Made with love for collectors',
    langPickTitle: 'Language',
    advanced: 'Collection & stores',
    filterCountry: 'Filter stores by country',
    filterCountrySub: 'Based on your profile country',
    confirmDel: 'Confirm before removing album',
    confirmDelSub: 'Ask for confirmation before delete',
    openFirst: 'Open stores first',
    openFirstSub: 'Sort the store list',
    showHint: 'Hints on store cards',
    showHintSub: '“Tap to see…” text',
    largeText: 'Large text',
    largeTextSub: 'More readable UI',
  },
  pt: {
    title: 'Ajustes',
    appearance: 'Aparerença',
    theme: 'Tema',
    themeDark: 'Escuro',
    themeLight: 'Claro',
    notifications: 'Notificações',
    notifAlbum: 'Álbum quase completo',
    notifAlbumSub: 'Quando passa de 90%',
    notifStores: 'Lojas novas por perto',
    notifStoresSub: 'Quando uma loja é adicionada',
    langRegion: 'Idioma e região',
    language: 'Idioma',
    data: 'Dados',
    export: 'Exportar coleção',
    exportSub: 'Guardar como arquivo',
    wipe: 'Apagar todos os dados',
    wipeModalTitle: 'Apagar todos os dados?',
    wipeModalBody:
      'Álbuns, figurinhas, perfil e ajustes neste dispositivo serão removidos. Não dá para desfazer.',
    wipeConfirm: 'Apagar tudo',
    wipeCancel: 'Cancelar',
    footer: 'Ficus · Feito com carinho para colecionadores',
    langPickTitle: 'Idioma',
    advanced: 'Coleção e lojas',
    filterCountry: 'Filtrar lojas por país',
    filterCountrySub: 'Conforme o país do perfil',
    confirmDel: 'Confirmar ao remover álbum',
    confirmDelSub: 'Pedir confirmação antes de apagar',
    openFirst: 'Lojas abertas primeiro',
    openFirstSub: 'Ordenar a lista de lojas',
    showHint: 'Dicas nos cartões de loja',
    showHintSub: 'Texto “Toque para ver…”',
    largeText: 'Texto grande',
    largeTextSub: 'Interface mais legível',
  },
})

const LANG_LABEL = { es: 'Español', en: 'English', pt: 'Português' }

/**
 * @param {{
 *   userPrefs: UserPreferences
 *   onSaveUserPrefs: (next: UserPreferences) => void
 *   appSettings: AppSettings
 *   onSaveAppSettings: (next: AppSettings) => void
 *   onWiped: () => void
 * }} props
 */
export function AjustesScreen({ userPrefs, onSaveUserPrefs, appSettings, onSaveAppSettings, onWiped }) {
  const t = COPY[userPrefs.locale] ?? COPY.es
  const [langOpen, setLangOpen] = useState(false)
  const [wipeOpen, setWipeOpen] = useState(false)

  const themeSubtitle = userPrefs.theme === 'light' ? t.themeLight : t.themeDark

  const versionLabel = useMemo(() => {
    const v = packageJson.version ?? '1.0.0'
    return v.startsWith('v') ? v : `v${v}`
  }, [])

  const toggleUser = (patch) => {
    onSaveUserPrefs({ ...userPrefs, ...patch })
  }

  const toggleApp = (patch) => {
    onSaveAppSettings({ ...appSettings, ...patch })
  }

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: packageJson.version,
      localStorage: readAllFicusLocalStorage(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ficus-coleccion-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const confirmWipe = () => {
    clearAllFicusLocalStorage()
    setWipeOpen(false)
    onWiped()
  }

  return (
    <div className="screen screen--ajustes fade-in">
      <header className="ajustes-header">
        <div className="ajustes-header__brand">
          <span className="ajustes-avatar">F</span>
          <div>
            <h1 className="ajustes-header__title">{t.title}</h1>
            <p className="ajustes-header__version">
              Ficus {versionLabel}
            </p>
          </div>
        </div>
      </header>

      <section className="ajustes-section" aria-label={t.appearance}>
        <h2 className="ajustes-section__label">{t.appearance}</h2>
        <div className="ajustes-card">
          <div className="ajustes-row ajustes-row--last">
            <span className="ajustes-icon-wrap ajustes-icon-wrap--sun">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1zM5.64 5.64a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zm10.3 10.3a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM4 13a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm14-1a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1zM6.34 17.66a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0zm10.3-10.3a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.theme}</span>
              <span className="ajustes-row__sub">{themeSubtitle}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${userPrefs.theme === 'dark' ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={userPrefs.theme === 'dark'}
              onClick={() => toggleUser({ theme: userPrefs.theme === 'dark' ? 'light' : 'dark' })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
        </div>
      </section>

      <section className="ajustes-section" aria-label={t.notifications}>
        <h2 className="ajustes-section__label">{t.notifications}</h2>
        <div className="ajustes-card">
          <div className="ajustes-row">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.notifAlbum}</span>
              <span className="ajustes-row__sub">{t.notifAlbumSub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${userPrefs.notifAlbumAlmostComplete ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={userPrefs.notifAlbumAlmostComplete}
              onClick={() => toggleUser({ notifAlbumAlmostComplete: !userPrefs.notifAlbumAlmostComplete })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
          <div className="ajustes-row ajustes-row--last">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.notifStores}</span>
              <span className="ajustes-row__sub">{t.notifStoresSub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${userPrefs.notifNewNearbyStores ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={userPrefs.notifNewNearbyStores}
              onClick={() => toggleUser({ notifNewNearbyStores: !userPrefs.notifNewNearbyStores })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
        </div>
      </section>

      <section className="ajustes-section" aria-label={t.langRegion}>
        <h2 className="ajustes-section__label">{t.langRegion}</h2>
        <div className="ajustes-card">
          <button type="button" className="ajustes-row ajustes-row--nav ajustes-row--last" onClick={() => setLangOpen(true)}>
            <span className="ajustes-icon-wrap ajustes-icon-wrap--globe">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.93 9h-2.05a15.5 15.5 0 0 0-1.2-5A8.03 8.03 0 0 1 18.93 11zm-8.93 8.93V13H5.07a8.02 8.02 0 0 0 5 6.93zM11 13H5.07a8.02 8.02 0 0 1 5-6.93V13zm2-8.93A8.02 8.02 0 0 1 18.93 11H13V4.07zm0 15.86V13h5.93a8.02 8.02 0 0 1-5.93 6.93zM13 11V4.07a8.02 8.02 0 0 1 5.93 6.93H13zm-2 0H5.07A8.02 8.02 0 0 1 11 4.07V11zm0 2v6.93A8.02 8.02 0 0 1 5.07 13H11z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.language}</span>
            </span>
            <span className="ajustes-row__value">{LANG_LABEL[userPrefs.locale]}</span>
          </button>
        </div>
      </section>

      <section className="ajustes-section" aria-label={t.advanced}>
        <h2 className="ajustes-section__label">{t.advanced}</h2>
        <div className="ajustes-card">
          <div className="ajustes-row">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.filterCountry}</span>
              <span className="ajustes-row__sub">{t.filterCountrySub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${appSettings.filterStoresByCountry ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={appSettings.filterStoresByCountry}
              onClick={() => toggleApp({ filterStoresByCountry: !appSettings.filterStoresByCountry })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
          <div className="ajustes-row">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.confirmDel}</span>
              <span className="ajustes-row__sub">{t.confirmDelSub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${appSettings.confirmBeforeDeleteAlbum ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={appSettings.confirmBeforeDeleteAlbum}
              onClick={() => toggleApp({ confirmBeforeDeleteAlbum: !appSettings.confirmBeforeDeleteAlbum })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
          <div className="ajustes-row">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.openFirst}</span>
              <span className="ajustes-row__sub">{t.openFirstSub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${appSettings.prioritizeOpenStores ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={appSettings.prioritizeOpenStores}
              onClick={() => toggleApp({ prioritizeOpenStores: !appSettings.prioritizeOpenStores })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
          <div className="ajustes-row">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.showHint}</span>
              <span className="ajustes-row__sub">{t.showHintSub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${appSettings.showStoreCardHint ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={appSettings.showStoreCardHint}
              onClick={() => toggleApp({ showStoreCardHint: !appSettings.showStoreCardHint })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
          <div className="ajustes-row ajustes-row--last">
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.largeText}</span>
              <span className="ajustes-row__sub">{t.largeTextSub}</span>
            </span>
            <button
              type="button"
              className={`ajustes-switch ${appSettings.largeTextMode ? 'ajustes-switch--on' : ''}`}
              role="switch"
              aria-checked={appSettings.largeTextMode}
              onClick={() => toggleApp({ largeTextMode: !appSettings.largeTextMode })}
            >
              <span className="ajustes-switch__knob" />
            </button>
          </div>
        </div>
      </section>

      <section className="ajustes-section" aria-label={t.data}>
        <h2 className="ajustes-section__label">{t.data}</h2>
        <div className="ajustes-card">
          <button type="button" className="ajustes-row ajustes-row--nav" onClick={exportJson}>
            <span className="ajustes-icon-wrap ajustes-icon-wrap--muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M19 12v7H5v-7H3v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" fill="currentColor" />
                <path d="M13 12.59V3h-2v9.59l-2.3-2.3-1.4 1.42L12 16l4.7-4.7-1.4-1.42L13 12.6z" fill="currentColor" />
              </svg>
            </span>
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.export}</span>
              <span className="ajustes-row__sub">{t.exportSub}</span>
            </span>
          </button>
          <button type="button" className="ajustes-row ajustes-row--danger ajustes-row--last" onClick={() => setWipeOpen(true)}>
            <span className="ajustes-icon-wrap ajustes-icon-wrap--danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zM9 11v8h2v-8H9zm4 0v8h2v-8h-2z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="ajustes-row__text">
              <span className="ajustes-row__title">{t.wipe}</span>
            </span>
          </button>
        </div>
      </section>

      <p className="ajustes-footer">{t.footer}</p>

      {langOpen && (
        <div className="ajustes-overlay" role="presentation" onClick={() => setLangOpen(false)}>
          <div
            className="ajustes-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ajustes-lang-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="ajustes-lang-title" className="ajustes-sheet__title">
              {t.langPickTitle}
            </h3>
            <ul className="ajustes-lang-list">
              {(['es', 'en', 'pt']).map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    className={`ajustes-lang-item ${userPrefs.locale === code ? 'ajustes-lang-item--active' : ''}`}
                    onClick={() => {
                      toggleUser({ locale: /** @type {'es'|'en'|'pt'} */ (code) })
                      setLangOpen(false)
                    }}
                  >
                    {LANG_LABEL[code]}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--secondary btn--block ajustes-sheet__close" onClick={() => setLangOpen(false)}>
              {t.wipeCancel}
            </button>
          </div>
        </div>
      )}

      {wipeOpen && (
        <div className="ajustes-overlay" role="presentation" onClick={() => setWipeOpen(false)}>
          <div
            className="ajustes-sheet ajustes-sheet--danger"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ajustes-wipe-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="ajustes-wipe-title" className="ajustes-sheet__title">
              {t.wipeModalTitle}
            </h3>
            <p className="ajustes-sheet__body">{t.wipeModalBody}</p>
            <div className="ajustes-sheet__actions">
              <button type="button" className="btn btn--danger btn--block" onClick={confirmWipe}>
                {t.wipeConfirm}
              </button>
              <button type="button" className="btn btn--muted btn--block" onClick={() => setWipeOpen(false)}>
                {t.wipeCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
