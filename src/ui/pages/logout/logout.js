import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import './logout.html'

Template.logout.onCreated(function () {
  const instance = this

  instance.initDependencies({
    language: true,
    translations: {
      de: () => import('./i18n/de')
    },
    tts: true,
    onComplete () {
      instance.state.set('dependenciesComplete', true)

      Meteor.logout(err => {
        if (err) console.error(err) // todo set failure state, display error
        instance.state.set('loggedOut', true)
      })
    }
  })
})

Template.logout.helpers({
  loadComplete () {
    return Template.getState('dependenciesComplete')
  },
  loggedOut () {
    return Template.getState('loggedOut')
  }
})
