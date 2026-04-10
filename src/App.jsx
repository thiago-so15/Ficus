import { useEffect, useLayoutEffect, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { ONBOARDING_TRANSITION_MS, TRANSITION_MS } from './constants/transitions'
import { getAlbumById, getNumbersForAlbum } from './data/albumsCatalog'
import { DEFAULT_APP_SETTINGS, normalizeAppSettings } from './data/appSettings'
import { getStoreById, STORES_CATALOG, STORE_TYPE_LABELS } from './data/storesCatalog'
import { DEFAULT_PROFILE } from './data/profileDefaults'
import {
  STORAGE_APP_INSTALL_AT,
  STORAGE_APP_SETTINGS,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_PROFILE,
  STORAGE_PROFILE_AVATAR_COLOR,
  STORAGE_PROFILE_DISPLAY_NAME,
  STORAGE_STICKER_STATES,
  STORAGE_STORE_FAVORITES,
  STORAGE_STORE_USER_REVIEWS,
  STORAGE_USER_ALBUMS,
  STORAGE_USER_PREFERENCES,
} from './data/storageKeys'
import { DEFAULT_USER_PREFERENCES, normalizeUserPreferences } from './data/userPreferences'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { usePersistentState } from './hooks/usePersistentState'
import { AddAlbumScreen } from './screens/AddAlbumScreen'
import { AjustesScreen } from './screens/AjustesScreen'
import { AlbumDetailScreen } from './screens/AlbumDetailScreen'
import { HomeScreen } from './screens/HomeScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { AlbumPrintSheetScreen } from './screens/AlbumPrintSheetScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { StoreDetailScreen } from './screens/StoreDetailScreen'
import { StoresScreen } from './screens/StoresScreen'
import { getStickerState } from './utils/albumStats'
import './App.css'

/** @typedef {'albums' | 'stores' | 'settings' | 'profile'} TabId */
/** @typedef {{ screen: 'home' | 'detail' | 'add', albumId: string | null }} AlbumsRoute */
/** @typedef {'idle' | 'push-prepare' | 'push-run' | 'pop-run'} AlbumsAnim */
/** @typedef {'idle' | 'push-prepare' | 'push-run' | 'pop-run'} StoresAnim */
/** @typedef {{ screen: 'list' } | { screen: 'detail', storeId: string }} StoresRoute */

function App() {
  const reducedMotion = usePrefersReducedMotion()
  const tMs = reducedMotion ? 0 : TRANSITION_MS

  const [onboardingDone, setOnboardingDone] = usePersistentState(STORAGE_ONBOARDING_COMPLETE, false)
  const [tab, setTab] = useState(/** @type {TabId} */ ('albums'))

  const [albumsRoute, setAlbumsRoute] = useState(
    /** @type {AlbumsRoute} */ ({
      screen: 'home',
      albumId: null,
    }),
  )

  const [userAlbumIds, setUserAlbumIds] = usePersistentState(STORAGE_USER_ALBUMS, [])
  const [stickerStates, setStickerStates] = usePersistentState(STORAGE_STICKER_STATES, {})
  const [profile, setProfile] = usePersistentState(STORAGE_PROFILE, DEFAULT_PROFILE)
  const [displayName, setDisplayName] = usePersistentState(STORAGE_PROFILE_DISPLAY_NAME, '')
  const [avatarColorIndex, setAvatarColorIndex] = usePersistentState(STORAGE_PROFILE_AVATAR_COLOR, 0)
  const [installAtIso] = usePersistentState(STORAGE_APP_INSTALL_AT, '')
  const [rawSettings, setRawSettings] = usePersistentState(STORAGE_APP_SETTINGS, DEFAULT_APP_SETTINGS)
  const [rawUserPrefs, setRawUserPrefs] = usePersistentState(STORAGE_USER_PREFERENCES, DEFAULT_USER_PREFERENCES)
  const [albumDeletedToast, setAlbumDeletedToast] = useState(/** @type {string | null} */ (null))

  const [navLocked, setNavLocked] = useState(false)

  /** @type {[{ from: TabId, to: TabId, step: 'prepare' | 'run' } | null, import('react').Dispatch<any>]} */
  const [tabCrossfade, setTabCrossfade] = useState(null)

  /** @type {[AlbumsAnim, import('react').Dispatch<import('react').SetStateAction<AlbumsAnim>>]} */
  const [albumsAnim, setAlbumsAnim] = useState(/** @type {AlbumsAnim} */ ('idle'))

  const [storesRoute, setStoresRoute] = useState(/** @type {StoresRoute} */ ({ screen: 'list' }))
  /** @type {[StoresAnim, import('react').Dispatch<import('react').SetStateAction<StoresAnim>>]} */
  const [storesAnim, setStoresAnim] = useState(/** @type {StoresAnim} */ ('idle'))

  const [favoriteStoreIds, setFavoriteStoreIds] = usePersistentState(STORAGE_STORE_FAVORITES, [])
  const [rawStoreUserReviews, setRawStoreUserReviews] = usePersistentState(STORAGE_STORE_USER_REVIEWS, {})

  const settings = normalizeAppSettings(rawSettings)
  const userPrefs = normalizeUserPreferences(rawUserPrefs)
  const printAlbumId = new URLSearchParams(window.location.search).get('printAlbum')

  useEffect(() => {
    document.documentElement.dataset.theme = userPrefs.theme
    document.documentElement.lang = userPrefs.locale
    document.documentElement.style.colorScheme = userPrefs.theme === 'dark' ? 'dark' : 'light'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', userPrefs.theme === 'dark' ? '#111111' : '#f2f2f2')
    }
  }, [userPrefs.theme, userPrefs.locale])

  useEffect(() => {
    if (!albumDeletedToast) return undefined
    const timer = window.setTimeout(() => setAlbumDeletedToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [albumDeletedToast])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_STICKER_STATES) return
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : {}
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setStickerStates(parsed)
        }
      } catch {
        /* ignore invalid payload */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [setStickerStates])

  /** Tab crossfade: prepare → run */
  useLayoutEffect(() => {
    if (!tabCrossfade || tabCrossfade.step !== 'prepare') return undefined
    let id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTabCrossfade((prev) => (prev && prev.step === 'prepare' ? { ...prev, step: 'run' } : prev))
      })
    })
    return () => cancelAnimationFrame(id)
  }, [tabCrossfade])

  /** Tab crossfade: fin */
  useEffect(() => {
    if (!tabCrossfade || tabCrossfade.step !== 'run') return undefined
    if (tMs === 0) {
      const id = window.setTimeout(() => {
        setTabCrossfade(null)
        setNavLocked(false)
      }, 0)
      return () => clearTimeout(id)
    }
    const timer = window.setTimeout(() => {
      setTabCrossfade(null)
      setNavLocked(false)
    }, tMs)
    return () => clearTimeout(timer)
  }, [tabCrossfade, tMs])

  /** Album push: prepare → run */
  useLayoutEffect(() => {
    if (albumsAnim !== 'push-prepare') return undefined
    let id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAlbumsAnim('push-run'))
    })
    return () => cancelAnimationFrame(id)
  }, [albumsAnim])

  /** Album push-run: fin */
  useEffect(() => {
    if (albumsAnim !== 'push-run') return undefined
    const timer = window.setTimeout(() => {
      setAlbumsAnim('idle')
      setNavLocked(false)
    }, tMs)
    return () => clearTimeout(timer)
  }, [albumsAnim, tMs])

  /** Tiendas push: prepare → run */
  useLayoutEffect(() => {
    if (storesAnim !== 'push-prepare') return undefined
    let id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setStoresAnim('push-run'))
    })
    return () => cancelAnimationFrame(id)
  }, [storesAnim])

  /** Tiendas push-run: fin */
  useEffect(() => {
    if (storesAnim !== 'push-run') return undefined
    const timer = window.setTimeout(() => {
      setStoresAnim('idle')
      setNavLocked(false)
    }, tMs)
    return () => clearTimeout(timer)
  }, [storesAnim, tMs])

  const finishOnboarding = () => {
    setOnboardingDone(true)
  }

  const pickAlbum = (id) => {
    if (navLocked) return
    if (reducedMotion) {
      setUserAlbumIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      setAlbumsRoute({ screen: 'home', albumId: null })
      return
    }
    setNavLocked(true)
    setAlbumsAnim('pop-run')
    window.setTimeout(() => {
      setUserAlbumIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      setAlbumsRoute({ screen: 'home', albumId: null })
      setAlbumsAnim('idle')
      setNavLocked(false)
    }, tMs)
  }

  const openAlbum = (id) => {
    if (navLocked) return
    if (reducedMotion) {
      setAlbumsRoute({ screen: 'detail', albumId: id })
      return
    }
    setNavLocked(true)
    setAlbumsRoute({ screen: 'detail', albumId: id })
    setAlbumsAnim('push-prepare')
  }

  const goAlbumsHome = () => {
    if (navLocked) return
    if (albumsRoute.screen === 'home') return
    if (reducedMotion) {
      setAlbumsRoute({ screen: 'home', albumId: null })
      return
    }
    setNavLocked(true)
    setAlbumsAnim('pop-run')
    window.setTimeout(() => {
      setAlbumsRoute({ screen: 'home', albumId: null })
      setAlbumsAnim('idle')
      setNavLocked(false)
    }, tMs)
  }

  const goAddAlbum = () => {
    if (navLocked) return
    if (reducedMotion) {
      setAlbumsRoute({ screen: 'add', albumId: null })
      return
    }
    setNavLocked(true)
    setAlbumsRoute({ screen: 'add', albumId: null })
    setAlbumsAnim('push-prepare')
  }

  const openAlbumPrintSheet = (albumId) => {
    const target = new URL(window.location.href)
    target.searchParams.set('printAlbum', albumId)
    window.open(target.toString(), '_blank', 'noopener,noreferrer')
  }

  const openStore = (/** @type {string} */ id) => {
    if (navLocked) return
    if (reducedMotion) {
      setStoresRoute({ screen: 'detail', storeId: id })
      return
    }
    setNavLocked(true)
    setStoresRoute({ screen: 'detail', storeId: id })
    setStoresAnim('push-prepare')
  }

  const goStoresList = () => {
    if (navLocked) return
    if (storesRoute.screen === 'list') return
    if (reducedMotion) {
      setStoresRoute({ screen: 'list' })
      return
    }
    setNavLocked(true)
    setStoresAnim('pop-run')
    window.setTimeout(() => {
      setStoresRoute({ screen: 'list' })
      setStoresAnim('idle')
      setNavLocked(false)
    }, tMs)
  }

  const toggleStoreFavorite = (/** @type {string} */ id) => {
    setFavoriteStoreIds((prev) => {
      const list = Array.isArray(prev) ? prev : []
      return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    })
  }

  /**
   * @param {string} storeId
   * @param {{ stars: number, text: string }} payload
   */
  const addStoreUserReview = (storeId, payload) => {
    const author = displayName?.trim() ? displayName.trim() : 'Usuario'
    setRawStoreUserReviews((prev) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `u-${String(prev?.[storeId]?.length ?? 0)}-${storeId}`
      const createdAt = new Date().toISOString()
      const base = prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}
      const cur = Array.isArray(base[storeId]) ? base[storeId] : []
      return {
        ...base,
        [storeId]: [{ id, author, stars: payload.stars, text: payload.text.trim(), createdAt }, ...cur],
      }
    })
  }

  /** @param {string} albumId */
  const removeAlbum = (albumId) => {
    const album = getAlbumById(albumId)
    const toastLabel = album?.name?.trim() ? `«${album.name.trim()}» eliminado` : 'Álbum eliminado'
    const viewingHere = albumsRoute.screen === 'detail' && albumsRoute.albumId === albumId

    if (viewingHere) {
      if (navLocked) return
      if (reducedMotion) {
        setUserAlbumIds((prev) => prev.filter((id) => id !== albumId))
        setStickerStates((prev) => {
          const next = { ...prev }
          delete next[albumId]
          return next
        })
        setAlbumsRoute({ screen: 'home', albumId: null })
        setAlbumDeletedToast(toastLabel)
        return
      }
      setNavLocked(true)
      setAlbumsAnim('pop-run')
      window.setTimeout(() => {
        setUserAlbumIds((prev) => prev.filter((id) => id !== albumId))
        setStickerStates((prev) => {
          const next = { ...prev }
          delete next[albumId]
          return next
        })
        setAlbumsRoute({ screen: 'home', albumId: null })
        setAlbumsAnim('idle')
        setNavLocked(false)
        setAlbumDeletedToast(toastLabel)
      }, tMs)
      return
    }

    setUserAlbumIds((prev) => prev.filter((id) => id !== albumId))
    setStickerStates((prev) => {
      const next = { ...prev }
      delete next[albumId]
      return next
    })
    setAlbumsRoute((route) =>
      route.screen === 'detail' && route.albumId === albumId ? { screen: 'home', albumId: null } : route,
    )
    setAlbumDeletedToast(toastLabel)
  }

  /**
   * @param {string} albumId
   * @param {number} num
   * @param {'missing' | 'owned' | 'duplicate'} state
   */
  const handleStickerChange = (albumId, num, state) => {
    setStickerStates((prev) => {
      const prevMap = { ...(prev[albumId] || {}) }
      if (state === 'missing') delete prevMap[String(num)]
      else prevMap[String(num)] = state
      return { ...prev, [albumId]: prevMap }
    })
  }

  /**
   * Marca como conseguidas solo las figuritas en faltante del rango. Devuelve cuántas cambiaron.
   * @param {string} albumId
   * @param {number} from
   * @param {number} to
   */
  const handleMarkRangeMissingAsOwned = (albumId, from, to) => {
    const album = getAlbumById(albumId)
    if (!album) return 0
    const prevMap = stickerStates[albumId] || {}
    let changed = 0
    for (const n of getNumbersForAlbum(album)) {
      if (n < from || n > to) continue
      if (getStickerState(prevMap, n) === 'missing') changed += 1
    }
    if (changed === 0) return 0
    setStickerStates((prev) => {
      const albumMap = { ...(prev[albumId] || {}) }
      for (const n of getNumbersForAlbum(album)) {
        if (n < from || n > to) continue
        if (getStickerState(albumMap, n) === 'missing') {
          albumMap[String(n)] = 'owned'
        }
      }
      return { ...prev, [albumId]: albumMap }
    })
    return changed
  }

  const detailAlbum =
    albumsRoute.screen === 'detail' && albumsRoute.albumId ? getAlbumById(albumsRoute.albumId) : null

  const detailStore = storesRoute.screen === 'detail' ? getStoreById(storesRoute.storeId) : null

  const showValidDetail = Boolean(detailAlbum)
  const showAdd = albumsRoute.screen === 'add'
  const showAlbumsHomeLayer = albumsRoute.screen === 'home' || albumsRoute.screen === 'detail' || albumsRoute.screen === 'add'

  const showStoresListLayer = storesRoute.screen === 'list' || storesRoute.screen === 'detail'
  const showStoresDetailLayer = storesRoute.screen === 'detail' && Boolean(detailStore)

  const userReviewsForDetailStore =
    detailStore &&
    rawStoreUserReviews &&
    typeof rawStoreUserReviews === 'object' &&
    !Array.isArray(rawStoreUserReviews) &&
    Array.isArray(rawStoreUserReviews[detailStore.id])
      ? rawStoreUserReviews[detailStore.id]
      : []

  const showBottomNav = onboardingDone && !showAdd

  if (printAlbumId) {
    const printAlbum = getAlbumById(printAlbumId)
    if (!printAlbum) {
      return (
        <div className="print-sheet print-sheet--missing">
          <h1>Álbum no encontrado</h1>
          <p>Revisá el enlace de impresión e intentá nuevamente.</p>
        </div>
      )
    }
    return <AlbumPrintSheetScreen album={printAlbum} stickerMap={stickerStates[printAlbum.id] || {}} />
  }

  const handleTabChange = (/** @type {TabId} */ t) => {
    if (navLocked) return
    if (t === tab) return
    const from = tab
    setTab(t)
    if (reducedMotion) return
    setTabCrossfade({ from, to: t, step: 'prepare' })
    setNavLocked(true)
  }

  const handleWipe = () => {
    window.location.reload()
  }

  /**
   * @param {TabId} tabId
   */
  const renderTabInner = (tabId) => {
    if (tabId === 'albums') {
      return (
        <div
          className={[
            'albums-stack',
            `albums-stack--screen-${albumsRoute.screen}`,
            albumsAnim === 'idle' ? 'albums-stack--idle' : 'albums-stack--transitioning',
            `albums-stack--anim-${albumsAnim}`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {showAlbumsHomeLayer && (
            <div
              className="albums-layer albums-layer--home"
              inert={albumsRoute.screen !== 'home' && albumsAnim === 'idle'}
              aria-hidden={albumsRoute.screen !== 'home' && albumsAnim === 'idle'}
            >
              <HomeScreen
                userAlbumIds={userAlbumIds}
                stickerStates={stickerStates}
                onOpenAlbum={openAlbum}
                onAddAlbum={goAddAlbum}
                onDeleteAlbum={removeAlbum}
                confirmBeforeDelete={settings.confirmBeforeDeleteAlbum}
              />
            </div>
          )}
          {showValidDetail && detailAlbum && (
            <div className="albums-layer albums-layer--cover albums-layer--detail"
              inert={albumsAnim !== 'idle'}
              aria-hidden={albumsAnim !== 'idle'}
            >
              <AlbumDetailScreen
                album={detailAlbum}
                stickerMap={stickerStates[detailAlbum.id] || {}}
                onBack={goAlbumsHome}
                onOpenPrintSheet={() => openAlbumPrintSheet(detailAlbum.id)}
                onStickerChange={(num, st) => handleStickerChange(detailAlbum.id, num, st)}
                onMarkRangeMissingAsOwned={(from, to) => handleMarkRangeMissingAsOwned(detailAlbum.id, from, to)}
              />
            </div>
          )}
          {showAdd && (
            <div className="albums-layer albums-layer--cover albums-layer--add"
              inert={albumsAnim !== 'idle'}
              aria-hidden={albumsAnim !== 'idle'}
            >
              <AddAlbumScreen userAlbumIds={userAlbumIds} onPick={pickAlbum} onBack={goAlbumsHome} />
            </div>
          )}
        </div>
      )
    }
    if (tabId === 'stores') {
      return (
        <div
          className={[
            'stores-stack',
            `stores-stack--screen-${storesRoute.screen}`,
            storesAnim === 'idle' ? 'stores-stack--idle' : 'stores-stack--transitioning',
            `stores-stack--anim-${storesAnim}`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {showStoresListLayer && (
            <div
              className="stores-layer stores-layer--list"
              inert={storesRoute.screen === 'detail' && storesAnim === 'idle'}
              aria-hidden={storesRoute.screen === 'detail' && storesAnim === 'idle'}
            >
              <StoresScreen
                allStores={STORES_CATALOG}
                profilePais={profile.pais}
                filterByProfileCountry={settings.filterStoresByCountry}
                prioritizeOpenStores={settings.prioritizeOpenStores}
                showStoreCardHint={settings.showStoreCardHint}
                onOpenStore={openStore}
              />
            </div>
          )}
          {showStoresDetailLayer && detailStore && (
            <div
              className="stores-layer stores-layer--cover stores-layer--detail"
              inert={storesAnim !== 'idle'}
              aria-hidden={storesAnim !== 'idle'}
            >
              <StoreDetailScreen
                key={detailStore.id}
                store={detailStore}
                typeLabel={STORE_TYPE_LABELS[detailStore.type]}
                onBack={goStoresList}
                isFavorite={Array.isArray(favoriteStoreIds) && favoriteStoreIds.includes(detailStore.id)}
                onToggleFavorite={() => toggleStoreFavorite(detailStore.id)}
                userReviews={userReviewsForDetailStore}
                onAddUserReview={(r) => addStoreUserReview(detailStore.id, r)}
                reviewAuthorName={displayName?.trim() ? displayName.trim() : 'Usuario'}
              />
            </div>
          )}
        </div>
      )
    }
    if (tabId === 'settings') {
      return (
        <AjustesScreen
          userPrefs={userPrefs}
          onSaveUserPrefs={setRawUserPrefs}
          appSettings={settings}
          onSaveAppSettings={setRawSettings}
          onWiped={handleWipe}
          transitionMs={tMs}
          reducedMotion={reducedMotion}
        />
      )
    }
    return (
      <ProfileScreen
        displayName={displayName}
        onSaveDisplayName={setDisplayName}
        avatarColorIndex={avatarColorIndex}
        onSaveAvatarColorIndex={setAvatarColorIndex}
        installAtIso={installAtIso}
        profile={profile}
        onSaveProfile={setProfile}
        userAlbumIds={userAlbumIds}
        stickerStates={stickerStates}
        locale={userPrefs.locale}
      />
    )
  }

  return (
    <div className={`app-shell ${settings.largeTextMode ? 'app-shell--large-text' : ''}`}>
      <div className={`app-frame ${showBottomNav ? 'app-frame--with-nav' : ''}`}>
        <main className="app-main app-main--nav">
          {!onboardingDone && (
            <OnboardingScreen
              onComplete={finishOnboarding}
              transitionMs={reducedMotion ? 0 : ONBOARDING_TRANSITION_MS}
              reducedMotion={reducedMotion}
            />
          )}
          {onboardingDone && (
            <div className="app-tab-viewport">
              {tabCrossfade ? (
                <>
                  <div
                    className={[
                      'app-tab-layer app-tab-layer--out',
                      tabCrossfade.step === 'run' && 'app-tab-layer--run',
                      tabCrossfade.step === 'run' && 'transition-will-change',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    inert=""
                    aria-hidden
                  >
                    <div className="app-tab-layer__inner">{renderTabInner(tabCrossfade.from)}</div>
                  </div>
                  <div
                    className={[
                      'app-tab-layer app-tab-layer--in',
                      tabCrossfade.step === 'run' && 'app-tab-layer--run',
                      tabCrossfade.step === 'run' && 'transition-will-change',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="app-tab-layer__inner">{renderTabInner(tabCrossfade.to)}</div>
                  </div>
                </>
              ) : (
                <div className="app-tab-layer app-tab-layer--single">
                  <div className="app-tab-layer__inner">{renderTabInner(tab)}</div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {showBottomNav && <BottomNav active={tab} onChange={handleTabChange} disabled={navLocked} />}
      {albumDeletedToast && (
        <div className="app-toast app-toast--album-deleted" role="status" aria-live="polite">
          {albumDeletedToast}
        </div>
      )}
    </div>
  )
}

export default App
