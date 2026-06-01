import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { EJSON } from 'meteor/ejson'
import { Schema } from '../../../api/schema/Schema'
import { loggedIn } from '../../../utils/accountUtils'
import './login.html'

const loginSchema = Schema.create({
  username: {
    type: String,
    max: 32,
    label: 'contexts.users.username',
    autoform: {
      autocomplete: 'username'
    }
  },
  password: {
    type: String,
    label: 'contexts.users.password',
    max: 128,
    autoform: {
      type: 'password',
      autocomplete: 'current-password'
    }
  }
})

const states = {
  login: 'login',
  loggedIn: 'loggedIn'
}

Template.login.onCreated(function () {
  this.autorun(() => {
    const view = this.state.get('view')
    if (loggedIn()) {
      return this.state.set('view', states.loggedIn)
    }
    if (!view) {
      this.state.set('view', states.login)
    }
  })
})

Template.login.helpers({
  loginError () {
    return Template.getState('loginError')
  },
  view (name) {
    return Template.getState('view') === name
  },
  loggedIn () {
    const instance = Template.instance()
    return (
      instance.state.get('view') === states.loggedIn &&
      !instance.state.get('loggingIn')
    )
  },
  loggingIn () {
    return Template.getState('loggingIn')
  },
  loginSchema () {
    return loginSchema
  }
})

Template.login.events({
  'click .login-button' (event, templateInstance) {
    event.preventDefault()

    templateInstance.state.set('loggingIn', true)
    const cb = (err) => {
      templateInstance.state.set('loggingIn', false)
      if (err) {
        const code = String(err.error)
        return templateInstance.state.set('loginError', {
          name: code,
          reason: err.reason,
          details: EJSON.stringify(err.details?.data)
        })
      }
    }

    try {
      Meteor.loginWithLea(cb)
    }
    catch (e) {
      templateInstance.state.set('loggingIn', false)
      return templateInstance.state.set('loginError', {
        name: e.error ?? e.name,
        reason: e.reason ?? e.message,
        details: EJSON.stringify(e.details?.data)
      })
    }
  }
})
