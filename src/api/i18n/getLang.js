import { Meteor } from 'meteor/meteor'

const { defaultLang } = Meteor.settings
const languages = {
  de: require('./de.json')
}

export const getServiceLang = (name) => languages[name] ?? languages[defaultLang]
