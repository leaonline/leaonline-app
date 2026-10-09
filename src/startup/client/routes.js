import { Routes } from '../../ui/routing/Routes'
import { Router } from '../../ui/routing/Router'

const defaultTarget = 'main-render-target'

Router.titlePrefix(Meteor.settings.public.app.name)
Router.loadingTemplate('loading')

const onError = (error) => {
  const { sendError } = require('../../contexts/errors/api/sendError')
  sendError({ error })
}

Object.values(Routes)
  .map((route) => {
    route.target = route.target || defaultTarget
    return route
  })
  .forEach((route) => Router.register(route, onError))
