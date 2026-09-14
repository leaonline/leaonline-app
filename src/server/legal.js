import { Meteor } from 'meteor/meteor'
import { Legal } from '../contexts/legal/Legal'
import { getCollection } from '../api/utils/getCollection'

Meteor.startup(async () => {
  const collection = getCollection(Legal.name)
  const configDoc = await collection.findOneAsync()
  if (!configDoc) {
    collection.insertAsync({
      imprint: 'Imprint',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact'
    })
  }
})
