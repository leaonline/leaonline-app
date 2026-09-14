import {Meteor} from 'meteor/meteor'
import {Template} from 'meteor/templating'
import './loginWithPassword.html'


Template.loginWithPassword.onRendered(function () {
    const instance = this
    instance.$('.pw-input').get(0).focus()
})

Template.loginWithPassword.helpers({
    submitting () {
        return Template.getState('loggingIn')
    },
    submitDisabled () {
        return Template.getState('loggingIn') || !Template.getState('input')
    }
})

Template.loginWithPassword.events({
    'input .pw-input' (event, templateInstance) {
        const input = $('.pw-input').val()
        templateInstance.state.set({ input })
    },
    'click .submit-btn'(event, templateInstance) {
        event.preventDefault()
        const { failure, success, clear } = Template.currentData()
        clear()
        templateInstance.state.set({ loggingIn: true })

        Meteor.loginWithPassword('foo', '123456', (err) => {
            setTimeout(() => {
            templateInstance.state.set('loggingIn', false)
            if (err) {
                if (err.message.includes('check your credentials')) {
                    failure(new Meteor.Error('login.failed', 'loginWithPassword.badCredentials'))
                } else {
                    failure(err)
                }
            }
            else success()
            }, 1000)
        })
    }
})

