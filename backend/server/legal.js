import { Meteor } from 'meteor/meteor'
import { Legal } from '../contexts/legal/Legal'
import { getCollection } from '../api/utils/getCollection'

Meteor.startup(() => {
  const collection = getCollection(Legal.name)
  const configDoc = collection.findOne()
  if (!configDoc) {
    collection.insert({
      imprint: 'Imprint',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact'
    })
  }
})
