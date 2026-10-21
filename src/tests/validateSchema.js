import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import validateSettings from '../.settingsschema'

describe('schema', () => {
  it('validates schema', async () => {
    await validateSettings(SimpleSchema, { ...Meteor.settings })
  })
})
