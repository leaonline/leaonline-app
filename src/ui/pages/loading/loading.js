import { Template } from 'meteor/templating'
import './loading.html'

Template.loading.onCreated(function () {
  const instance = this
  instance.initDependencies({
    onComplete: () => {
      instance.state.set('loadComplete', true)
    },
    onError: () => {
      instance.state.set('loadComplete', true)
    }
  })
})

Template.loading.helpers({
  loadComplete () {
    return Template.getState('loadComplete')
  }
})
