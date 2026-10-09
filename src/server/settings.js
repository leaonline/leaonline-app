import { Meteor } from 'meteor/meteor'
import validateSettings from '../.settingsschema'

validateSettings(Meteor.settings)
