import {Users} from "../../../../../contexts/users/Users";
import { debounce } from "../../../../utils/debounce";
import {callMethod} from "../../../../../infrastructure/methods/callMethod";
import './loginWithEmail.html'

const emailRegex = /.+@.+\..+/

Template.loginWithEmail.onCreated(function () {
    const instance = this
    instance.state.set({ view: 'request', email: '', requestDisabled: true })
    instance.initDependencies({
        contexts: [Users],
        language: true,
        tts: true,
        translations: {
            de: () => import('./i18n/de')
        },
        onComplete: () => {
            instance.state.set('dependenciesComplete', true)
        },
        onError: e => {
            // instance.data.onFail()
            instance.state.set('dependenciesComplete', true)
        }
    })
})
Template.loginWithEmail.helpers({
    loadComplete () {
        return Template.getState('dependenciesComplete')
    },
    loading () {
        return Template.getState('loading')
    },
    view(name) {
        return Template.getState('view') === name
    },
    invalid () {
        return Template.getState('invalid')
    },
    requestDisabled () {
        return Template.getState('loading') || Template.getState('requestDisabled')
    }
})
Template.loginWithEmail.events({
    'input #request-input': debounce((event, templateInstance) => {
        if (templateInstance.state.get('invalid')) {
            templateInstance.state.set('invalid', false)
        }
        const email = templateInstance.$('#request-input').val()
        templateInstance.state.set({
            email, requestDisabled: email === templateInstance.state.get('email')
        })
    }, 50),
    'click .request-btn' (event, templateInstance) {
        event.preventDefault()
        templateInstance.state.set({
            loading: true,
            invalid: false
        })
        const email = templateInstance.$('#request-input').val()
        if (!emailRegex.test(email)) {
            return templateInstance.state.set({
                loading: false,
                invalid: true,
                requestDisabled: true
            })
        }

        callMethod({
            name: Users.methods.passwordlessLogin,
            args: { email },
            success: () => {
                templateInstance.state.set({
                    view: 'confirm',
                    loading: false,
                    invalid: false,
                    requestDisabled: false
                })
            }
        })
    }
})