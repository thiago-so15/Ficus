import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { copyTextToClipboard } from '../utils/sharePlainText'

/**
 * @param {{
 *   open: boolean
 *   onClose: () => void
 *   shareTitle: string
 *   shareText: string
 *   onFeedback: (message: string) => void
 * }} props
 */
export function ShareOptionsSheet({ open, onClose, shareTitle, shareText, onFeedback }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const openWhatsApp = () => {
    const u = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(u, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const openSms = () => {
    const u = `sms:?body=${encodeURIComponent(shareText)}`
    window.location.href = u
    onClose()
  }

  const openMail = () => {
    const s = encodeURIComponent(shareTitle)
    const b = encodeURIComponent(shareText)
    window.location.href = `mailto:?subject=${s}&body=${b}`
    onClose()
  }

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(shareText)
    onFeedback(ok ? 'Copiado al portapapeles' : 'No se pudo copiar')
    onClose()
  }

  const handleNativeShare = async () => {
    if (typeof navigator.share !== 'function') return
    try {
      await navigator.share({ title: shareTitle, text: shareText })
      onClose()
    } catch (e) {
      if (/** @type {any} */ (e)?.name === 'AbortError') return
      onFeedback('No se pudo abrir el menú de compartir')
    }
  }

  const canNativeShare = typeof navigator.share === 'function'

  return createPortal(
    <div className="app-modal app-modal--visible share-options-modal" role="presentation">
      <button type="button" className="app-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div
        className="share-options-sheet app-modal__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-options-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-options-sheet__handle" aria-hidden />
        <h2 id="share-options-title" className="share-options-sheet__title">
          Compartir progreso
        </h2>
        <p className="share-options-sheet__subtitle">Elegí cómo enviarlo</p>
        <ul className="share-options-sheet__list">
          <li>
            <button type="button" className="share-options-sheet__btn share-options-sheet__btn--whatsapp" onClick={openWhatsApp}>
              <span className="share-options-sheet__btn-label">WhatsApp</span>
              <span className="share-options-sheet__btn-hint">Abrir chat con el texto listo</span>
            </button>
          </li>
          <li>
            <button type="button" className="share-options-sheet__btn" onClick={openSms}>
              <span className="share-options-sheet__btn-label">Mensaje (SMS)</span>
              <span className="share-options-sheet__btn-hint">App de mensajes del teléfono</span>
            </button>
          </li>
          <li>
            <button type="button" className="share-options-sheet__btn" onClick={openMail}>
              <span className="share-options-sheet__btn-label">Correo</span>
              <span className="share-options-sheet__btn-hint">Abrir tu app de mail</span>
            </button>
          </li>
          {canNativeShare && (
            <li>
              <button type="button" className="share-options-sheet__btn" onClick={handleNativeShare}>
                <span className="share-options-sheet__btn-label">Más opciones</span>
                <span className="share-options-sheet__btn-hint">Compartir con otras apps</span>
              </button>
            </li>
          )}
          <li>
            <button type="button" className="share-options-sheet__btn" onClick={handleCopy}>
              <span className="share-options-sheet__btn-label">Copiar texto</span>
              <span className="share-options-sheet__btn-hint">Pegalo donde quieras</span>
            </button>
          </li>
        </ul>
        <button type="button" className="btn btn--muted btn--block share-options-sheet__cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>,
    document.body,
  )
}
