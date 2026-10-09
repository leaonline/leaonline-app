import { Template } from 'meteor/templating'
import { fadeOut } from '../../../utils/animationUtils'
import './notFound.html'

Template.notFound.onCreated(function () {
  const instance = this
  instance.initDependencies({
    tts: true,
    language: true,
    translations: {
      de: () => import('./i18n/de')
    },
    onComplete () {
      instance.state.set('dependenciesComplete', true)
    }
  })
})

Template.notFound.helpers({
  loadComplete () {
    return Template.getState('dependenciesComplete')
  }
})

Template.notFound.events({
  'click .lea-pagenotfound-button' (event, templateInstance) {
    event.preventDefault()

    fadeOut('.lea-pagenotfound-container', templateInstance, () => {
      templateInstance.data.next()
    })
  }
})
