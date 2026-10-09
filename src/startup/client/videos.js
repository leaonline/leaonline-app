import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Videos } from '../../contexts/Videos/Videos'

Template.registerHelper('video', function (name) {
  console.log('get video', name, Videos.helpers.get(name))
  return Videos.helpers.get(name)
})

Meteor.startup(function () {
  Videos.helpers.load((err, res) => {
    console.log('videos loaded', err, res)
  })
})
