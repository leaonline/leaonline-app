import { Router } from './Router'

export const gotoRoute = (route, ...args) => {
  const fullpath = route.path.apply(null, args)
  return Router.go(fullpath)
}
