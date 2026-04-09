import { useEffect, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { getAlbumById } from './data/albumsCatalog'
import { DEFAULT_APP_SETTINGS, normalizeAppSettings } from './data/appSettings'
import { STORES_CATALOG } from './data/storesCatalog'
import { DEFAULT_PROFILE } from './data/profileDefaults'
import {
  STORAGE_APP_SETTINGS,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_PROFILE,
  STORAGE_PROFILE_INTRO,
  STORAGE_STICKER_STATES,
  STORAGE_USER_ALBUMS,
  STORAGE_USER_PREFERENCES,
} from './data/storageKeys'
import { DEFAULT_USER_PREFERENCES, normalizeUserPreferences } from './data/userPreferences'
import { usePersistentState } from './hooks/usePersistentState'
import { AddAlbumScreen } from './screens/AddAlbumScreen'
import { AjustesScreen } from './screens/AjustesScreen'
import { AlbumDetailScreen } from './screens/AlbumDetailScreen'
import { HomeScreen } from './screens/HomeScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { StoresScreen } from './screens/StoresScreen'
import './App.css'

function App() {
  const [onboardingDone, setOnboardingDone] = usePersistentState(STORAGE_ONBOARDING_COMPLETE, false)
  const [tab, setTab] = useState(/** @type {'albums' | 'stores' | 'settings' | 'profile'} */ ('albums'))

  const [albumsRoute, setAlbumsRoute] = useState(
    /** @type {{ screen: 'home' | 'detail' | 'add', albumId: string | null }} */ ({
      screen: 'home',
      albumId: null,
    }),
  )

  const [userAlbumIds, setUserAlbumIds] = usePersistentState(STORAGE_USER_ALBUMS, [])
  const [stickerStates, setStickerStates] = usePersistentState(STORAGE_STICKER_STATES, {})
  const [profile, setProfile] = usePersistentState(STORAGE_PROFILE, DEFAULT_PROFILE)
  const [profileIntroSeen, setProfileIntroSeen] = usePersistentState(STORAGE_PROFILE_INTRO, false)
  const [rawSettings, setRawSettings] = usePersistentState(STORAGE_APP_SETTINGS, DEFAULT_APP_SETTINGS)
  const [rawUserPrefs, setRawUserPrefs] = usePersistentState(STORAGE_USER_PREFERENCES, DEFAULT_USER_PREFERENCES)

  const settings = normalizeAppSettings(rawSettings)
  const userPrefs = normalizeUserPreferences(rawUserPrefs)

  useEffect(() => {
    document.documentElement.dataset.theme = userPrefs.theme
    document.documentElement.lang = userPrefs.locale
    document.documentElement.style.colorScheme = userPrefs.theme === 'dark' ? 'dark' : 'light'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', userPrefs.theme === 'dark' ? '#111111' : '#f2f2f2')
    }
  }, [userPrefs.theme, userPrefs.locale])

  const finishOnboarding = () => {
    setOnboardingDone(true)
  }

  const pickAlbum = (id) => {
    setUserAlbumIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setAlbumsRoute({ screen: 'home', albumId: null })
  }

  const openAlbum = (id) => setAlbumsRoute({ screen: 'detail', albumId: id })
  const goAlbumsHome = () => setAlbumsRoute({ screen: 'home', albumId: null })
  const goAddAlbum = () => setAlbumsRoute({ screen: 'add', albumId: null })

  /** @param {string} albumId */
  const removeAlbum = (albumId) => {
    setUserAlbumIds((prev) => prev.filter((id) => id !== albumId))
    setStickerStates((prev) => {
      const next = { ...prev }
      delete next[albumId]
      return next
    })
    setAlbumsRoute((route) =>
      route.screen === 'detail' && route.albumId === albumId
        ? { screen: 'home', albumId: null }
        : route,
    )
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

  const detailAlbum =
    albumsRoute.screen === 'detail' && albumsRoute.albumId ? getAlbumById(albumsRoute.albumId) : null

  const showValidDetail = Boolean(detailAlbum)
  const showAdd = albumsRoute.screen === 'add'
  const showAlbumsHome = !showAdd && !showValidDetail

  const showBottomNav = onboardingDone && !showAdd

  const handleTabChange = (/** @type {'albums' | 'stores' | 'settings' | 'profile'} */ t) => {
    setTab(t)
  }

  const handleWipe = () => {
    window.location.reload()
  }

  return (
    <div className={`app-shell ${settings.largeTextMode ? 'app-shell--large-text' : ''}`}>
      <div className={`app-frame ${showBottomNav ? 'app-frame--with-nav' : ''}`}>
        <main className="app-main">
          {!onboardingDone && <OnboardingScreen onComplete={finishOnboarding} />}
          {onboardingDone && (
            <>
              {tab === 'albums' && (
                <>
                  {showAlbumsHome && (
                    <HomeScreen
                      userAlbumIds={userAlbumIds}
                      stickerStates={stickerStates}
                      onOpenAlbum={openAlbum}
                      onAddAlbum={goAddAlbum}
                      onDeleteAlbum={removeAlbum}
                      confirmBeforeDelete={settings.confirmBeforeDeleteAlbum}
                    />
                  )}
                  {albumsRoute.screen === 'add' && (
                    <AddAlbumScreen userAlbumIds={userAlbumIds} onPick={pickAlbum} onBack={goAlbumsHome} />
                  )}
                  {showValidDetail && detailAlbum && (
                    <AlbumDetailScreen
                      album={detailAlbum}
                      stickerMap={stickerStates[detailAlbum.id] || {}}
                      onBack={goAlbumsHome}
                      onStickerChange={(num, st) => handleStickerChange(detailAlbum.id, num, st)}
                    />
                  )}
                </>
              )}
              {tab === 'stores' && (
                <StoresScreen
                  allStores={STORES_CATALOG}
                  profilePais={profile.pais}
                  filterByProfileCountry={settings.filterStoresByCountry}
                  prioritizeOpenStores={settings.prioritizeOpenStores}
                  showStoreCardHint={settings.showStoreCardHint}
                />
              )}
              {tab === 'settings' && (
                <AjustesScreen
                  userPrefs={userPrefs}
                  onSaveUserPrefs={setRawUserPrefs}
                  appSettings={settings}
                  onSaveAppSettings={setRawSettings}
                  onWiped={handleWipe}
                />
              )}
              {tab === 'profile' && (
                <ProfileScreen
                  profile={profile}
                  onSaveProfile={setProfile}
                  profileIntroSeen={profileIntroSeen}
                  onProfileIntroContinue={() => setProfileIntroSeen(true)}
                  userAlbumIds={userAlbumIds}
                  stickerStates={stickerStates}
                />
              )}
            </>
          )}
        </main>
      </div>
      {showBottomNav && <BottomNav active={tab} onChange={handleTabChange} />}
    </div>
  )
}

export default App
