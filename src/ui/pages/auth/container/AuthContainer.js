import {isCurrentRoute} from "../../../routing/isCurrentRoute";
import './AuthContainer.html'

const authRoutes = [
    {
        name: 'login',
        label: 'auth.login',
        icon: 'lock-open'
    },
    {
        name: 'register',
        label: 'auth.register',
        icon: 'rocket'
    },
    {
        name: 'restore',
        label: 'auth.restore',
        icon: 'key'
    }
]

Template.AuthContainer.onCreated(function () {
    const instance = this
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

Template.AuthContainer.helpers({
    dependenciesComplete: () => Template.getState('dependenciesComplete'),
    authRoutes: () => authRoutes,
    isCurrent: (name)  => isCurrentRoute(name, { reactive: true })
})