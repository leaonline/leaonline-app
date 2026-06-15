import {callMethod} from "../../../../../infrastructure/methods/callMethod";
import './registerNewUser.html'

Template.registerNewUser.onCreated(function () {
    const instance = this
    instance.state.set('accountStatus', 'decide')

    instance.initDependencies({
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

    instance.createUser = () => {
        callMethod({
            name: Users.methods.create,
            args: {},
            prepare: () => instance.state.set('accountStatus', 'creating'),
            failure: instance.onError,
            success: () => {
                instance.state.set('accountStatus', 'created')
            },
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
    }
})
Template.registerNewUser.events({})