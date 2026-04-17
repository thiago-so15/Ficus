/**
 * Textos del onboarding por idioma (alineado con UserPreferences.locale).
 * @typedef {'es' | 'en' | 'pt'} Locale
 */

/** @type {Record<Locale, {
 *   pickTitle: string
 *   pickSubtitle: string
 *   slide0Slogan: string
 *   slide0Start: string
 *   slide1Title: string
 *   slide1Desc: string
 *   slide2Title: string
 *   slide2Desc: string
 *   slide3Title: string
 *   slide3Desc: string
 *   slide3Cta: string
 *   back: string
 *   next: string
 *   skip: string
 *   dotsListLabel: string
 *   dotAria: string
 *   legendOwned: string
 *   legendDuplicate: string
 *   legendMissing: string
 *   storeOpen: string
 *   storeClosed: string
 * }>} */
export const ONBOARDING_COPY = {
  es: {
    pickTitle: 'Elige tu idioma',
    pickSubtitle: 'Podés cambiarlo después en Ajustes.',
    slide0Slogan: 'Tu colección, siempre al día',
    slide0Start: 'Empezar',
    slide1Title: 'Seguí tus figuritas fácilmente',
    slide1Desc:
      'Tocá cada casillero para marcar si te falta, si la tenés o si tenés duplicadas. Todo queda guardado en tu dispositivo.',
    slide2Title: 'Encontrá tiendas cerca tuyo',
    slide2Desc: 'Explorá kioscos, librerías y jugueterías con dirección, tipo y si están abiertos ahora.',
    slide3Title: 'Seguí tu progreso en cada álbum',
    slide3Desc: 'Mirá cuántas figuritas llevás, el porcentaje completado y agregá nuevos álbumes cuando quieras.',
    slide3Cta: 'Empezar a coleccionar',
    back: 'Atrás',
    next: 'Siguiente',
    skip: 'Saltar',
    dotsListLabel: 'Paso del tutorial',
    dotAria: 'Paso {n} de {total}',
    legendOwned: 'Conseguida',
    legendDuplicate: 'Duplicada',
    legendMissing: 'Faltante',
    storeOpen: 'Abierto',
    storeClosed: 'Cerrado',
  },
  en: {
    pickTitle: 'Choose your language',
    pickSubtitle: 'You can change it later in Settings.',
    slide0Slogan: 'Your collection, always up to date',
    slide0Start: 'Get started',
    slide1Title: 'Track your stickers easily',
    slide1Desc:
      'Tap each slot to mark missing, owned, or duplicates. Everything stays saved on your device.',
    slide2Title: 'Find stores near you',
    slide2Desc: 'Browse kiosks, bookstores, and toy shops with address, type, and whether they are open now.',
    slide3Title: 'Follow your progress per album',
    slide3Desc: 'See how many stickers you have, completion percentage, and add new albums anytime.',
    slide3Cta: 'Start collecting',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    dotsListLabel: 'Tutorial step',
    dotAria: 'Step {n} of {total}',
    legendOwned: 'Owned',
    legendDuplicate: 'Duplicate',
    legendMissing: 'Missing',
    storeOpen: 'Open',
    storeClosed: 'Closed',
  },
  pt: {
    pickTitle: 'Escolha o idioma',
    pickSubtitle: 'Você pode mudar depois em Ajustes.',
    slide0Slogan: 'Sua coleção sempre em dia',
    slide0Start: 'Começar',
    slide1Title: 'Acompanhe suas figurinhas com facilidade',
    slide1Desc:
      'Toque em cada espaço para marcar falta, obtida ou duplicada. Tudo fica salvo no seu dispositivo.',
    slide2Title: 'Encontre lojas perto de você',
    slide2Desc: 'Explore quiosques, livrarias e lojas de brinquedos com endereço, tipo e se estão abertas agora.',
    slide3Title: 'Acompanhe seu progresso em cada álbum',
    slide3Desc: 'Veja quantas figurinhas você tem, a porcentagem concluída e adicione novos álbuns quando quiser.',
    slide3Cta: 'Começar a colecionar',
    back: 'Voltar',
    next: 'Próximo',
    skip: 'Pular',
    dotsListLabel: 'Passo do tutorial',
    dotAria: 'Passo {n} de {total}',
    legendOwned: 'Obtida',
    legendDuplicate: 'Duplicada',
    legendMissing: 'Faltando',
    storeOpen: 'Aberto',
    storeClosed: 'Fechado',
  },
}

/**
 * @param {string | undefined} locale
 */
export function getOnboardingCopy(locale) {
  if (locale === 'en' || locale === 'pt') return ONBOARDING_COPY[locale]
  return ONBOARDING_COPY.es
}

/**
 * @param {string} pattern
 * @param {number} n
 * @param {number} [total]
 */
export function formatOnboardingDotAria(pattern, n, total = 4) {
  return pattern.replace('{n}', String(n)).replace('{total}', String(total))
}
