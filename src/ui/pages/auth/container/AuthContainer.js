import './AuthContainer.html'
import {isCurrentRoute} from "../../../routing/isCurrentRoute";

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

Template.AuthContainer.helpers({
    authRoutes: () => authRoutes,
    isCurrent: (name)  => isCurrentRoute(name, { reactive: true })
})