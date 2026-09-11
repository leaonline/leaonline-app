import {LoginMethods} from "./LoginMethods";
import {dataTarget} from "../../../../utils/dataTarget";
import '../container/AuthContainer'
import '../../../components/error/errorMessage'
import './login.html'
import {errorToObject} from "../../../../utils/object/errorToObject";

Template.login.onCreated(function () {
    const instance = this
    instance.availableLogins = Object.values(LoginMethods).map(entry => {
        const label = `pages.login.logins.${entry.label ?? entry.name}`
        const info = `pages.login.infos.${entry.info ?? entry.name}`
        return {
            ...entry,
            label,
            info,
            tts: entry.tts ? `pages.login.logins.${entry.tts}` : label,
            icon: entry.icon ?? entry.name,
            iconPos: 'right',
            color: entry.color ?? 'secondary',
            template: entry.template ?? 'notFound'
        }
    })
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
})

Template.login.helpers({
    dependenciesComplete() {
        return Template.getState('dependenciesComplete')
    },
    availableLogins() {
        return Template.instance().availableLogins
    },
    currentLoginMethod () {
        return Template.getState('currentLoginMethod')
    },
    currentLoginData () {
        const instance = Template.instance()
        return {
            success: instance.data.success,
            failure: error => instance.state.set({ error }),
            clear: () => instance.state.set({ error: null })
        }
    },
    loadingLoginMethod() {
        return Template.getState('loadingLoginMethod')
    },
    error () {
        return Template.getState('error')
    }
})

Template.login.events({
    'click .lea-login-btn': async function (event, templateInstance) {
        event.preventDefault()
        const name = dataTarget(event, 'name')
        const current = templateInstance.availableLogins.find(m => m.name === name)
        if (!current) {
            return
        }
        templateInstance.state.set('loadingLoginMethod', true)
        await current.load()
        templateInstance.state.set({
            loadingLoginMethod: false,
            currentLoginMethod: current
        })
    },
    'click .reset-method-btn' (event, templateInstance) {
        event.preventDefault()
        templateInstance.state.set('currentLoginMethod', null)
    }
})