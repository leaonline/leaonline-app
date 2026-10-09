import { Meteor } from 'meteor/meteor'
import './model.tests'
import './navigation.tests'
import './data.tests'

if (Meteor.isClient) {
  require('./components.tests')
  require('./chooser.tests')
}
