import { ReactiveDict } from 'meteor/reactive-dict'

export const Preferences = {}

const prefs = new ReactiveDict()

Preferences.useSoundButtons =  (value) => {
  if (typeof value === 'boolean') {
    prefs.set('useSoundButtons', value)
  }
  return prefs.get('useSoundButtons')
}