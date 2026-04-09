import { useMemo, useState } from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { PAISES_ES } from '../data/paisesEs'
import {
  AVATAR_COLOR_CYCLE,
  getDisplayInitial,
  normalizeAvatarColorIndex,
  formatCollectorSince,
} from '../data/profileDisplay'
import { normalizeProfile, TIPOS_COLECCION_OPTIONS } from '../data/profileDefaults'
import { computeAchievementsUnlocked, computeProfileAggregates, daysSinceInstall } from '../utils/profileAggregates'
import { validatePais } from '../utils/validateLocation'

const ACHIEVEMENTS = /** @type {const} */ ([
  {
    id: 'first',
    title: 'Primer álbum',
    desc: 'Agregá tu primer álbum',
    key: 'firstAlbum',
    color: '#1D9E75',
  },
  {
    id: 'centenario',
    title: 'Centenario',
    desc: 'Conseguí 100 figuritas',
    key: 'centenario',
    color: '#3B82F6',
  },
  {
    id: 'complete',
    title: 'Álbum completo',
    desc: 'Completá un álbum al 100%',
    key: 'oneComplete',
    color: '#8B5CF6',
  },
  {
    id: 'collector',
    title: 'Coleccionista',
    desc: 'Tené 5 álbumes',
    key: 'fiveAlbums',
    color: '#F97316',
  },
  {
    id: 'fivehundred',
    title: '500 figuritas',
    desc: 'Conseguí 500 figuritas',
    key: 'fiveHundred',
    color: '#EC4899',
  },
  {
    id: 'legend',
    title: 'Leyenda',
    desc: 'Completá 3 álbumes',
    key: 'legend',
    color: '#EAB308',
  },
])

/**
 * @param {{
 *   displayName: string
 *   onSaveDisplayName: (name: string) => void
 *   avatarColorIndex: number
 *   onSaveAvatarColorIndex: (index: number) => void
 *   installAtIso: string
 *   profile: import('../data/profileDefaults').UserProfile | Record<string, unknown>
 *   onSaveProfile: (next: import('../data/profileDefaults').UserProfile) => void
 *   userAlbumIds: string[]
 *   stickerStates: Record<string, Record<string, string>>
 *   locale?: string
 * }} props
 */
export function ProfileScreen({
  displayName,
  onSaveDisplayName,
  avatarColorIndex,
  onSaveAvatarColorIndex,
  installAtIso,
  profile,
  onSaveProfile,
  userAlbumIds,
  stickerStates,
  locale = 'es',
}) {
  const saved = useMemo(() => normalizeProfile(profile), [profile])

  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(displayName)
  const [pais, setPais] = useState(() => saved.pais)
  const [locationError, setLocationError] = useState('')

  const colorIdx = normalizeAvatarColorIndex(avatarColorIndex)
  const avatarBg = AVATAR_COLOR_CYCLE[colorIdx]

  const effectiveDisplayName = useMemo(() => {
    const d = displayName.trim()
    if (d) return d
    const legacy = [saved.nombre.trim(), saved.apellido.trim()].filter(Boolean).join(' ')
    return legacy || 'Coleccionista'
  }, [displayName, saved.nombre, saved.apellido])

  const initialLetter = useMemo(() => getDisplayInitial(effectiveDisplayName), [effectiveDisplayName])

  const agg = useMemo(
    () => computeProfileAggregates(userAlbumIds, stickerStates),
    [userAlbumIds, stickerStates],
  )

  const unlocked = useMemo(() => computeAchievementsUnlocked(agg), [agg])

  const sinceLabel = useMemo(() => {
    const m = formatCollectorSince(installAtIso || new Date().toISOString(), locale)
    return m ? m.charAt(0).toUpperCase() + m.slice(1) : ''
  }, [installAtIso, locale])

  const activeDays = useMemo(() => daysSinceInstall(installAtIso || new Date().toISOString()), [installAtIso])

  const cycleAvatarColor = () => {
    const next = (colorIdx + 1) % AVATAR_COLOR_CYCLE.length
    onSaveAvatarColorIndex(next)
  }

  const saveName = () => {
    onSaveDisplayName(draftName.trim())
    setEditingName(false)
  }

  const savePais = () => {
    const p = pais.trim()
    const check = validatePais(p)
    if (!check.ok) {
      setLocationError(check.message)
      return
    }
    setLocationError('')
    onSaveProfile({
      ...saved,
      pais: p,
      region: saved.region,
      basicsSaved: true,
      tiposColeccion: saved.tiposColeccion,
    })
  }

  const toggleTipo = (id) => {
    const cur = saved.tiposColeccion
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    onSaveProfile({
      ...saved,
      tiposColeccion: next,
    })
  }

  return (
    <div className="screen screen--profile-v2 fade-in">
      <header className="profile-v2-header">
        <div className="profile-v2-avatar-block">
          <div className="profile-v2-avatar-wrap">
            <div className="profile-v2-avatar" style={{ background: avatarBg }} aria-hidden>
              {initialLetter}
            </div>
            <button
              type="button"
              className="profile-v2-avatar-pencil"
              onClick={cycleAvatarColor}
              aria-label="Cambiar color del avatar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <h1 className="profile-v2-name">{effectiveDisplayName}</h1>
          {sinceLabel && (
            <p className="profile-v2-since">Coleccionista desde {sinceLabel}</p>
          )}
          {!editingName ? (
            <button type="button" className="profile-v2-edit-name" onClick={() => { setDraftName(displayName); setEditingName(true) }}>
              Editar nombre
            </button>
          ) : (
            <div className="profile-v2-name-edit">
              <input
                type="text"
                className="profile-v2-name-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Tu nombre"
                maxLength={80}
                aria-label="Nombre"
              />
              <button type="button" className="btn btn--primary profile-v2-name-save" onClick={saveName}>
                Guardar
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="profile-v2-stats" aria-label="Estadísticas">
        <div className="profile-v2-stats__row">
          <div className="profile-v2-stat-card">
            <span className="profile-v2-stat-card__value">{agg.albumCount}</span>
            <span className="profile-v2-stat-card__label">Álbumes</span>
          </div>
          <div className="profile-v2-stat-card">
            <span className="profile-v2-stat-card__value">{agg.totalFilled}</span>
            <span className="profile-v2-stat-card__label">Figuritas conseguidas</span>
          </div>
          <div className="profile-v2-stat-card">
            <span className="profile-v2-stat-card__value">{agg.avgPct}%</span>
            <span className="profile-v2-stat-card__label">Promedio completado</span>
          </div>
        </div>
        <div className="profile-v2-stats__row">
          <div className="profile-v2-stat-card">
            <span className="profile-v2-stat-card__value">{agg.totalDuplicate}</span>
            <span className="profile-v2-stat-card__label">Figuritas duplicadas</span>
          </div>
          <div className="profile-v2-stat-card">
            <span className="profile-v2-stat-card__value">{agg.completeAlbums}</span>
            <span className="profile-v2-stat-card__label">Álbumes completos</span>
          </div>
          <div className="profile-v2-stat-card">
            <span className="profile-v2-stat-card__value">{activeDays}</span>
            <span className="profile-v2-stat-card__label">Días activo</span>
          </div>
        </div>
      </section>

      <section className="profile-v2-section" aria-label="Logros">
        <h2 className="profile-v2-section__title">Logros</h2>
        <div className="profile-v2-achievements">
          {ACHIEVEMENTS.map((a) => {
            const isOn = unlocked[/** @type {keyof typeof unlocked} */ (a.key)]
            return (
              <div
                key={a.id}
                className={`profile-v2-achievement ${isOn ? 'profile-v2-achievement--on' : 'profile-v2-achievement--off'}`}
              >
                <div
                  className="profile-v2-achievement__icon"
                  style={{ background: isOn ? a.color : 'var(--surface-raised)' }}
                >
                  {isOn ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M12 2l2.9 6.62L22 9.27l-5 4.9L18.18 22 12 18.77 5.82 22 7 14.17l-5-4.9 7.1-1.65L12 2z"
                        fill="#fff"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </div>
                <p className="profile-v2-achievement__title">{a.title}</p>
                <p className="profile-v2-achievement__desc">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="profile-v2-section" aria-label="Álbumes favoritos">
        <h2 className="profile-v2-section__title">Álbumes favoritos</h2>
        {agg.albumRowsSorted.length === 0 ? (
          <p className="profile-v2-empty">Todavía no tenés álbumes. Agregá uno desde Álbumes.</p>
        ) : (
          <ul className="profile-v2-fav-list">
            {agg.albumRowsSorted.map(({ album, stats }) => (
              <li key={album.id} className="profile-v2-fav-row">
                <div className="profile-v2-fav-row__top">
                  <div className="profile-v2-fav-row__text">
                    <span className="profile-v2-fav-row__name">{album.name}</span>
                    <span className="profile-v2-fav-row__meta">
                      {album.publisher} · {album.totalStickers} figuritas
                    </span>
                  </div>
                  <span className="profile-v2-fav-row__pct">{stats.pct}%</span>
                </div>
                <ProgressBar value={stats.filled} max={album.totalStickers} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="profile-v2-section" aria-label="Preferencias">
        <h2 className="profile-v2-section__title">Ubicación y gustos</h2>
        <p className="profile-v2-section__hint">Usamos el país para filtrar tiendas si lo activás en Ajustes.</p>
        {locationError && (
          <div className="profile-alert" role="alert">
            {locationError}
          </div>
        )}
        <div className="profile-form profile-v2-pais-form">
          <label className="field">
            <span className="field__label">País</span>
            <input
              className="field__input"
              type="text"
              value={pais}
              onChange={(e) => {
                setPais(e.target.value)
                if (locationError) setLocationError('')
              }}
              placeholder="Ej.: Argentina"
              list="lista-paises-ficus-profile"
              maxLength={80}
              autoComplete="off"
            />
            <datalist id="lista-paises-ficus-profile">
              {PAISES_ES.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>
        </div>
        <button type="button" className="btn btn--secondary btn--block" onClick={savePais}>
          Guardar país
        </button>

        <h3 className="profile-v2-subtitle">¿Qué tipo de álbumes coleccionás?</h3>
        <div className="profile-tipo-chips" role="group" aria-label="Tipos de álbumes">
          {TIPOS_COLECCION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`profile-tipo-chip ${saved.tiposColeccion.includes(opt.id) ? 'profile-tipo-chip--on' : ''}`}
              onClick={() => toggleTipo(opt.id)}
              aria-pressed={saved.tiposColeccion.includes(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <p className="profile-privacy">Tus datos se guardan solo en este dispositivo.</p>
    </div>
  )
}
