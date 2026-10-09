import { Meteor } from 'meteor/meteor'
import validateSettings from '../.settingsschema'

const settings = { ...Meteor.settings }

validateSettings(settings)
