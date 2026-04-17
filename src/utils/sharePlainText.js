/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

/**
 * Comparte texto con la API nativa o lo copia al portapapeles.
 * @param {{ title: string, text: string }} opts
 * @returns {Promise<'shared' | 'copied' | 'aborted' | 'failed'>}
 */
export async function sharePlainText({ title, text }) {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (e) {
      if (/** @type {any} */ (e)?.name === 'AbortError') return 'aborted'
    }
  }
  const copied = await copyTextToClipboard(text)
  return copied ? 'copied' : 'failed'
}
