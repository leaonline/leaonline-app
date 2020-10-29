import { Meteor } from 'meteor/meteor'
import { TestCollection } from '../imports/TestCollection'
import { Random } from 'meteor/random'

Meteor.startup(() => {
  const amount = Math.floor(Math.random() * 10)

  for (let i = 0; i < amount; i++) {
    TestCollection.insert({
      name: Random.id(),
      value: Math.floor(Math.random() * 100000)
    })
  }
})

Meteor.methods({
  'count' () {
    return TestCollection.find().count()
  },
  'add' () {
    return TestCollection.insert({
      name: Random.id(),
      value: Math.floor(Math.random() * 100000)
    })
  }
})

Meteor.publish('allDocs', function () {
  return TestCollection.find()
})