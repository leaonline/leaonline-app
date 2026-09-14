import { Routes } from './Routes'
import settings from '../../resources/i18n/de/routes'
import { Router } from './Router' // TODO load dynamically using i18n locale

export const resolveRoute = function resolve (key, ...optionalArgs) {
  const route = Routes[key]
  if (!route) {
    return settings.notFound
  }
  return route && route.path(...optionalArgs)
}

export const backRoute = function () {
  const current = Router.current()
  const { oldRoute } = current
  return oldRoute.path
}
