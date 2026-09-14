import {callMethod} from "../../../../infrastructure/methods/callMethod";
import {dataTarget} from "../../../../utils/dataTarget";
import {Legal} from "../../../../contexts/legal/Legal";
import {Users} from "../../../../contexts/users/Users";
import '../../../components/modal/modal'
import '../container/AuthContainer'
import './registerNewUser.html'
import {asyncTimeout} from "../../../../utils/asyncTimeout";

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

    const onSuccess = instance.data.success
    instance.createUser = async () => {
        instance.state.set({ accountStatus: 'creating', createStatus: { label: 'auth.create.user', icon: 'user' }, createProgress: 0 })
        await asyncTimeout(300)
        instance.state.set({ createProgress: 20 })

        await asyncTimeout(1000)
  //      const {token, restore} = await callMethod({
  //          name: Users.methods.create,
  //          args: {termsAndConditionsIsChecked: true}
  //      })

        instance.state.set({ createStatus: { label: 'auth.create.login', icon: 'lock-open' }, createProgress: 60 })
        await asyncTimeout(1000)
        instance.state.set({ createStatus: { label: 'auth.create.complete', icon: 'check' }, createProgress: 100 })
        await asyncTimeout(300)
//        await loginWithToken(token)
        instance.state.set({ accountStatus: 'loggedIn', restoreCode: '123-456-789' })
    }
})

Template.registerNewUser.helpers({
    loadComplete() {
        return Template.getState('dependenciesComplete')
    },
    accountStatus(name) {
        return Template.getState('accountStatus') === name
    },
    availableLogins() {
        return Template.instance().availableLogins
    },
    accepted(type) {
        return Template.getState('accepted')?.[type]
    },
    legal() {
        return Template.getState('legal')
    },
    canRegister() {
        const accepted = Template.getState('accepted') ?? {}
        return accepted.terms && accepted.privacy
    },
    createProgress () {
        return Template.getState('createProgress')
    },
    restoreCode () {
        return Template.getState('restoreCode')
    },
    createStatus () {
        return Template.getState('createStatus')
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
                args: {name: type}
            })
            legal.loaded = true
        }
        templateInstance.state.set({legal})
        templateInstance.modal = templateInstance.api.showModal('#legal-modal')
    },
    'click .legal-accept-btn': async function (event, templateInstance) {
        event.preventDefault()
        const type = dataTarget(event, 'type')
        const accepted = templateInstance.state.get('accepted') ?? {}
        accepted[type] = true
        templateInstance.state.set({accepted})
        templateInstance.modal.hide()
    },
    'click .register-btn'(event, templateInstance) {
        event.preventDefault()
        templateInstance.createUser().catch(templateInstance.error)
    }
})

const loginWithToken = async (token) => {
    return new Promise((resolve, reject) => {
        Meteor.loginWithToken(token, error => {
            if (error) {
                return reject(error)
            } else {
                return resolve()
            }
        })
    })
}