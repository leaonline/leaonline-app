import { dataTarget } from '../../../utils/dataTarget'
import { Theme } from '../../theme/Theme'
import './topnav.html'

Template.topnav.onCreated(function () {
  Theme.init()
})

Template.topnav.helpers({
  theme (value) {
    const current = Theme.get()
    if (value) {
      return value === current
    }
    return current
  }
})

Template.topnav.events({
  'click .theme-btn' (event) {
    const value = dataTarget(event)
    Theme.set(value, true)
  }
})
