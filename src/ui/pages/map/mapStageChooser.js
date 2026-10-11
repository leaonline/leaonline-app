import { Template } from 'meteor/templating'
import { Tracker } from 'meteor/tracker'
import 'meteor/leaonline:ui/components/icon/icon'
import Modal from 'bootstrap/js/dist/modal'
import { translate } from '../../../api/i18n/translate'
import './mapStageChooser.html'

export const mapPercent = (metric) =>
  metric?.percent == null
    ? translate('map.unavailable')
    : `${Math.round(metric.percent)}%`
Template.mapChoiceSummary.helpers({
  pagePercent() {
    return mapPercent(this.choice.progress)
  },
  competencyCount() {
    return `${this.choice.competencies.current ?? '–'} / ${this.choice.competencies.max ?? '–'}`
  },
})
let scope = 0
Template.mapStageChooser.onCreated(function () {
  this.titleId = `map-chooser-title-${++scope}`
})
Template.mapStageChooser.onRendered(function () {
  this.element = this.find('.modal')
  this.onHidden = () => {
    if (!this.view.isDestroyed) this.data.onClose()
  }
  this.element.addEventListener('hidden.bs.modal', this.onHidden)
  this.modal = new Modal(this.element)
  this.modal.show()
  const firstChoice =
    this.find('.map-unitset:not(:disabled), .map-decision') ||
    this.find('.map-chooser-close')
  firstChoice?.focus()
  let deciding = false
  this.autorun(() => {
    const next = !!Template.currentData().deciding
    if (deciding === next) return
    deciding = next
    Tracker.afterFlush(() => {
      if (this.view.isDestroyed) return
      const selector = next ? '.map-decision' : '.map-unitset:not(:disabled)'
      this.find(selector)?.focus()
    })
  })
})
Template.mapStageChooser.onDestroyed(function () {
  this.element?.removeEventListener('hidden.bs.modal', this.onHidden)
  // No fade: hide removes backdrop/focus handlers before dispose on navigation.
  this.modal?.hide()
  this.modal?.dispose()
})
Template.mapStageChooser.helpers({
  titleId: () => Template.instance().titleId,
  disabled() {
    return this.busy || this.offline
  },
})
Template.mapStageChooser.events({
  'click .map-chooser-close'(event, instance) {
    instance.modal.hide()
  },
  'click .map-unitset'(event, instance) {
    instance.data.onSelect(event.currentTarget.dataset.unitset)
  },
  'click .map-decision'(event, instance) {
    instance.data.onDecision(event.currentTarget.dataset.decision)
  },
})
