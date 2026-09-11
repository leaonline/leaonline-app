export const LoginMethods = {
    password: {
        name: 'password',
        icon: 'keyboard',
        color: 'info',
        template: 'loginWithPassword',
        load: () => import('./password/loginWithPassword')
    },
    /*
   email: {
   name: 'email',
   icon: 'envelope',
       template: 'loginWithEmail',
       load: () => import('./logins/email/loginWithEmail')
   },
   qrcode: {
      name: 'qrcode'
   },
   apple: {
   name: 'apple'
   },
  google: {
    name: 'google',
    icon: 'google',
    action: (instance) => {
      Meteor.loginWithGoogle(error => {
        if (error) {
          return fatal({ error })
        }
        instance.data.onSuccess()
      })
    }
  },
   */
}