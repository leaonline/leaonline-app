import { ReactiveDict } from 'meteor/reactive-dict'
import { dataTarget } from '../../../utils/dataTarget'
import './decision.html'

const state = new ReactiveDict({})

Template.decision.helpers({
  title () {
    return state.get('title')
  },
  options () {
    console.debug('options', state.get('options'))
    return state.get('options')
  },
  type () {
    return state.get('type')
  }
})

Template.decision.events({
  'shown.bs.modal' (event, templateInstance) {
    templateInstance.state.set({ decision: null })
  },
  'click .decision-button' (event, templateInstance) {
    event.preventDefault()
    const decision = dataTarget(event)
    templateInstance.state.set({ decision })
    templateInstance.$('#decision-modal').modal('hide')
  },
  'click .decision-cancel' (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set({ decision: 'cancel' })
    templateInstance.$('#decision-modal').modal('hide')
  },
  'hidden.bs.modal' (event, templateInstance) {
    const decision = templateInstance.state.get('decision')
    state.set({ decision: decision ?? 'cancel' })
  }
})

export const requestDecision = ({ title, type="primary", options }) => {
  state.set({ title, options, type })
  $('#decision-modal').modal('show')

  return new Promise(resolve => {
    Tracker.autorun((c) => {
      const decision = state.get('decision')
      if (decision) {
        c.stop()
        state.set({ decision: null, options: null })
        resolve({ decision })
      }
    })
  })
}