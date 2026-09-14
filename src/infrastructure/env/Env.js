import { Meteor } from 'meteor/meteor'

const env = Meteor.settings.public.env.toLowerCase()

export const Env = {}

Env.isDev = env === 'dev'
Env.isStaging = env === 'staging'
Env.isProd = env === 'production'
Env.get = () => env
Env.on = (types, fn) => {
  if (!Array.isArray(types)) {
    types = [types]
  }
  if (types.includes(env)) {
    fn()
  }
}
