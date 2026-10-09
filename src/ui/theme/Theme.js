import { AppStorage } from '../storage/AppStorage'
import { ReactiveVar } from 'meteor/reactive-var'

export const Theme = {}

const theme = new ReactiveVar()
const LIGHT = 'light'
const DARK = 'dark'
const isSupported = (value) => [LIGHT, DARK].includes(value)
const updateDOM = (value) => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.document.documentElement.setAttribute('data-bs-theme', value)
  }
}
const getPreferredTheme = () => {
  const storedTheme = AppStorage.get('theme')
  if (storedTheme) {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT
}

Theme.set = (value, save = false) => {
  const current = theme.get()
  if (value !== current && isSupported(value)) {
    theme.set(value)
    updateDOM(value)
    if (save) {
      AppStorage.set('theme', value)
    }
  }
}

Theme.get = () => theme.get()

Theme.init = () => Theme.set(getPreferredTheme())
