import { useMemo, useState } from 'react'
import { getAlbumById } from '../data/albumsCatalog'
import { PAISES_ES } from '../data/paisesEs'
import { normalizeProfile, TIPOS_COLECCION_OPTIONS } from '../data/profileDefaults'
import { countAlbumStats } from '../utils/albumStats'
import { validatePais } from '../utils/validateLocation'

/**
 * @param {string} nombre
 * @param {string} apellido
 */
function getInitialsFromName(nombre, apellido) {
  const n = nombre.trim()
  const a = apellido.trim()
  const c1 = n.charAt(0)
  const c2 = a.charAt(0)
  if (!c1 && !c2) return '·'
  if (!c2) return c1.toUpperCase()
  if (!c1) return c2.toUpperCase()
  return (c1 + c2).toUpperCase()
}

/**
 * @param {{
 *   profile: import('../data/profileDefaults').UserProfile | Record<string, unknown>
 *   onSaveProfile: (next: import('../data/profileDefaults').UserProfile) => void
 *   profileIntroSeen: boolean
 *   onProfileIntroContinue: () => void
 *   userAlbumIds: string[]
 *   stickerStates: Record<string, Record<string, string>>
 * }} props
 */
export function ProfileScreen({
  profile,
  onSaveProfile,
  profileIntroSeen,
  onProfileIntroContinue,
  userAlbumIds,
  stickerStates,
}) {
  const saved = useMemo(() => normalizeProfile(profile), [profile])

  const [nombre, setNombre] = useState(() => saved.nombre)
  const [apellido, setApellido] = useState(() => saved.apellido)
  const [fechaNacimiento, setFechaNacimiento] = useState(() => saved.fechaNacimiento)
  const [pais, setPais] = useState(() => saved.pais)
  const [locationError, setLocationError] = useState('')

  const stats = useMemo(() => {
    const albums = userAlbumIds.map((id) => getAlbumById(id)).filter(Boolean)
    let totalFilled = 0
    let sumPct = 0
    for (const album of albums) {
      const s = countAlbumStats(album, stickerStates[album.id])
      totalFilled += s.filled
      sumPct += s.pct
    }
    const n = albums.length
    return {
      albums: n,
      stickers: totalFilled,
      avg: n ? Math.round(sumPct / n) : 0,
    }
  }, [userAlbumIds, stickerStates])

  const displayFullName = [nombre.trim(), apellido.trim()].filter(Boolean).join(' ') || 'Coleccionista'

  const handleSubmitBasics = (e) => {
    e.preventDefault()
    const p = pais.trim()
    const check = validatePais(p)
    if (!check.ok) {
      setLocationError(check.message)
      return
    }
    setLocationError('')
    onSaveProfile({
      ...saved,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      fechaNacimiento,
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

  if (!profileIntroSeen) {
    return (
      <div className="screen screen--profile screen--profile-welcome fade-in">
        <div className="profile-welcome">
          <h1 className="profile-welcome__title">Bienvenido a perfil</h1>
          <p className="profile-welcome__text">
            Completá tus datos para personalizar tu experiencia en Ficus. Podés editarlos cuando quieras.
          </p>
          <button type="button" className="btn btn--primary profile-welcome__cta" onClick={onProfileIntroContinue}>
            Continuar
          </button>
        </div>
      </div>
    )
  }

  if (saved.basicsSaved) {
    return (
      <div className="screen screen--profile screen--profile-compact fade-in">
        <header className="screen-header">
          <h1 className="app-title">Perfil</h1>
        </header>

        <div className="profile-card profile-card--compact">
          <div className="profile-avatar" aria-hidden>
            {getInitialsFromName(saved.nombre, saved.apellido)}
          </div>
          <p className="profile-display-name profile-display-name--solo">
            {[saved.nombre.trim(), saved.apellido.trim()].filter(Boolean).join(' ') || 'Coleccionista'}
          </p>
        </div>

        <div className="profile-compact-form">
          <h2 className="profile-question-title">¿Qué tipo de álbumes coleccionás?</h2>
          <p className="profile-question-hint">Tocá para elegir; se guarda solo en este dispositivo.</p>
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
        </div>

        <p className="profile-privacy">Tus datos se guardan solo en este dispositivo.</p>
      </div>
    )
  }

  return (
    <div className="screen screen--profile fade-in">
      <header className="screen-header">
        <h1 className="app-title">Perfil</h1>
        <p className="app-subtitle">Tus datos en Ficus</p>
      </header>

      <div className="profile-card">
        <div className="profile-avatar" aria-hidden>
          {getInitialsFromName(nombre, apellido)}
        </div>
        <p className="profile-display-name">{displayFullName}</p>
      </div>

      <section className="profile-summary" aria-label="Resumen de tu colección">
        <div className="profile-summary__cell">
          <span className="profile-summary__value">{stats.albums}</span>
          <span className="profile-summary__label">Álbumes</span>
        </div>
        <div className="profile-summary__cell">
          <span className="profile-summary__value">{stats.stickers}</span>
          <span className="profile-summary__label">Figuritas</span>
        </div>
        <div className="profile-summary__cell">
          <span className="profile-summary__value">{stats.avg}%</span>
          <span className="profile-summary__label">Promedio</span>
        </div>
      </section>

      <form className="profile-form" onSubmit={handleSubmitBasics}>
        <p className="profile-form__lead">Completá o actualizá tu información:</p>
        {locationError && (
          <div className="profile-alert" role="alert">
            {locationError}
          </div>
        )}
        <label className="field">
          <span className="field__label">Nombre</span>
          <input
            className="field__input"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="given-name"
            maxLength={60}
          />
        </label>
        <label className="field">
          <span className="field__label">Apellido</span>
          <input
            className="field__input"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Tu apellido"
            autoComplete="family-name"
            maxLength={60}
          />
        </label>
        <label className="field">
          <span className="field__label">Fecha de nacimiento</span>
          <input
            className="field__input"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </label>
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
            autoComplete="country-name"
            maxLength={80}
            list="lista-paises-ficus"
          />
          <datalist id="lista-paises-ficus">
            {PAISES_ES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <button type="submit" className="btn btn--primary btn--block">
          Guardar cambios
        </button>
      </form>

      <p className="profile-privacy">Tus datos se guardan solo en este dispositivo.</p>
    </div>
  )
}
