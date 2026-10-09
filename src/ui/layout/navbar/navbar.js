import { Template } from 'meteor/templating'
import { ColorType } from '../../../contexts/types/ColorType'
import './navbar.html'

Template.navbar.onDestroyed(function () {
  this.state.clear()
})

Template.navbar.onCreated(function () {
  this.initDependencies({
    language: true,
    tts: true,
    onComplete: () => this.state.set('dependenciesLoaded', true),
  })

  this.autorun(() => {
    const data = Template.currentData()
    const { sessionDoc, showProgress, dimensionDoc, levelDoc, unitSetDoc } =
      data
    if (!sessionDoc || !unitSetDoc || !dimensionDoc || !levelDoc) {
      return this.state.set({
        showProgress: false,
      })
    }

    const colorType =
      ColorType.byIndex(dimensionDoc.colorType)?.type || 'primary'
    const current = (sessionDoc.progress || 0) + 1
    const max = unitSetDoc.progress || 0
    const value = (current / max) * 100
    const rounded = Math.round(value)
    const progress = {
      current,
      max,
      value,
      rounded,
      type: colorType,
    }

    const labels = {
      dimension: dimensionDoc?.title,
      level: levelDoc?.title,
      type: colorType,
    }

    const loadComplete = true
    this.state.set({ showProgress, progress, labels, loadComplete })
  })
})

Template.navbar.helpers({
  loadComplete() {
    const instance = Template.instance()
    return (
      instance.state.get('dependenciesLoaded') &&
      instance.state.get('loadComplete')
    )
  },
  showProgress() {
    return Template.getState('showProgress')
  },
  progress() {
    return Template.getState('progress')
  },
  labels() {
    return Template.getState('labels')
  },
  hasExit() {
    return Template.instance().data.onExit
  },
})

Template.navbar.events({
  'click .navbar-overview-button'(event, templateInstance) {
    event.preventDefault()
    templateInstance.$('#navbar-modal').modal('show')
  },
  'click .navbar-confirm-cancel'(event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('confirmed', true)
    templateInstance.$('#navbar-modal').modal('hide')
  },
  'hidden.bs.modal'(event, templateInstance) {
    const confirmed = templateInstance.state.get('confirmed')
    if (confirmed) {
      templateInstance.state.set('confirmed', null)
      templateInstance.data.onExit()
    }
  },
})
