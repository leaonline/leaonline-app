import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Routes } from '../../ui/routing/Routes'
import { Router } from '../../ui/routing/Router'
import { resolveRoute, backRoute } from '../../ui/routing/routeHelpers'
import { Env } from '../../infrastructure/env/Env'

export const RouteHelpers = {}

RouteHelpers.fullUrl = (path) => Meteor.absoluteUrl(path)
RouteHelpers.route = (key, ...optionalArgs) => resolveRoute(key, ...optionalArgs)
RouteHelpers.routeDef = (key) => Routes[key]
RouteHelpers.backRoute = () => backRoute()
RouteHelpers.referrer = () => {
  const location = Router.location()
  return encodeURIComponent(location)
}
RouteHelpers.encodeURIComponent = (value) => encodeURIComponent(value)
RouteHelpers.join = (char, ...args) => {
  args.pop()
  return args.join(char)
}
RouteHelpers.log = (...args) => {
  args.pop()
  console.log(...args)
}
RouteHelpers.url = (path) => {
  return Meteor.absoluteUrl(path, {
    secure: Meteor.isProduction
  })
}
RouteHelpers.isDebugUser = () => global.isDebugUser()
RouteHelpers.isDemoUser = (userObj) => {
  const user = userObj || Meteor.user() || {}
  return user.demo
}
RouteHelpers.isEnv = env => Env.get() === env

const helpers = Object.entries(RouteHelpers)
for (const [name, method] of helpers) {
  Template.registerHelper(name, method)
}
