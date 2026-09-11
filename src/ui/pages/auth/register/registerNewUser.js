import {callMethod} from "../../../../infrastructure/methods/callMethod";
import {dataTarget} from "../../../../utils/dataTarget";
import {Legal} from "../../../../contexts/legal/Legal";
import { Users } from "../../../../contexts/users/Users";
import '../../../components/modal/modal'
import '../container/AuthContainer'
import './registerNewUser.html'

Template.registerNewUser.onCreated(function () {
    const instance = this
    instance.state.set('accountStatus', 'decide')
    instance.initDependencies({
        contexts: [Users, Legal],
        language: true,
        tts: true,
        translations: {
            de: () => import('./i18n/de')
        },
        onComplete: async () => {
            instance.state.set('dependenciesComplete', true)
        },
        onError: e => {
            // instance.data.onFail()
            instance.state.set('dependenciesComplete', true)
        }
    })

    instance.legalTypes = {
        terms: {
            name: 'terms',
            title: 'logins.new.account.open.terms',
            text: '<h1>...</h1>',
            loaded: false
        },
        privacy: {
            name: 'privacy',
            title: 'logins.new.account.open.privacy',
            text: '<h1>...</h1>',
            loaded: false
        }
    }

    instance.createUser = () => {
        callMethod({
            name: Users.methods.create,
            args: { termsAndConditionsIsChecked: true },
            prepare: () => instance.state.set('accountStatus', 'creating'),
            failure: instance.onError,
            success: ({ token }) => {
                Meteor.loginWithToken(token, error => console.error(error))
                instance.state.set('accountStatus', 'created')
            }
        })
    }
})

Template.registerNewUser.helpers({
    loadComplete () {
        return Template.getState('dependenciesComplete')
    },
    accountStatus (name) {
        return Template.getState('accountStatus') === name
    },
    availableLogins () {
        return Template.instance().availableLogins
    },
    accepted (type) {
        return Template.getState('accepted')?.[type]
    },
    legal () {
        return Template.getState('legal')
    },
    canRegister () {
        const accepted = Template.getState('accepted') ?? {}
        return accepted.terms && accepted.privacy
    }
})
Template.registerNewUser.events({
    'click .legal-modal-btn': async function (event, templateInstance) {
        event.preventDefault()
        const type = dataTarget(event, 'type')
        const legal = templateInstance.legalTypes[type]
        if (!legal) return
        if (!legal.loaded) {
            legal.text = await callMethod({
                name: Legal.methods.get.name,
                args: { name: type }
            })
            legal.loaded = true
        }
        templateInstance.state.set({ legal })
        templateInstance.modal = templateInstance.api.showModal('#legal-modal')
    },
    'click .legal-accept-btn': async function (event, templateInstance) {
        event.preventDefault()
        const type = dataTarget(event, 'type')
        const accepted = templateInstance.state.get('accepted') ?? {}
        accepted[type] = true
        templateInstance.state.set({ accepted })
        templateInstance.modal.hide()
    },
    'click .register-btn' (event, templateInstance) {
        event.preventDefault()
        templateInstance.createUser()
    }
})
