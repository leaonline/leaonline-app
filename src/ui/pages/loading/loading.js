import { Template } from 'meteor/templating'
import './loading.html'

Template.loading.onCreated(function () {
  this.initDependencies({
    onComplete: () => {
      this.state.set('loadComplete', true)
    },
    onError: () => {
      this.state.set('loadComplete', true)
    },
  })
})

Template.loading.helpers({
  loadComplete() {
    return Template.getState('loadComplete')
  },
})
