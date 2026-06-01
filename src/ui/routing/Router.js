import { FlowRouter, RouterHelpers } from 'meteor/ostrio:flow-router-extra'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import { translate } from '../../api/i18n/translate'

/**
 * Facade to a router to support a common definition for routing in case
 * the underlying router will change or be replaced due to a better version
 * or when development of the router stopped.
 */
export const Router = {}
Router.src = FlowRouter
Router.debug = false

Router.go = function (value, ...optionalArgs) {
  const type = typeof value
  if (type === 'object' && value !== null) {
    return FlowRouter.go(value.path(...optionalArgs))
  }
  else if (type === 'string') {
    return FlowRouter.go(value)
  }
  else {
    throw new Error(`Unexpected format: got [${type}], expected string or object`)
  }
}

Router.has = function (path) {
  return paths[path]
}

Router.location = function (options = {}) {
  if (options.pathName) {
    return FlowRouter.current().route.name
  }
  return FlowRouter.current().path
}

Router.current = function (options = {}) {
  if (options.reactive) {
    FlowRouter.watchPathChange()
  }
  return FlowRouter.current()
}

Router.param = function (value) {
  const type = typeof value
  if (type === 'object') {
    return FlowRouter.setParams(value)
  }
  if (type === 'string') {
    return FlowRouter.getParam(value)
  }
  throw new Error(`Unexpected format: [${type}], expected string or object`)
}

Router.queryParam = function (value) {
  const type = typeof value
  if (type === 'object') {
    return FlowRouter.setQueryParams(value)
  }
  if (type === 'string') {
    return FlowRouter.getQueryParam(value)
  }
  throw new Error(`Unexpected format: [${type}], expected string or object`)
}

let _titlePrefix = ''

Router.titlePrefix = function (value = '') {
  _titlePrefix = value
}

let _loadingTemplate

Router.loadingTemplate = function (value = 'loading') {
  _loadingTemplate = value
}

const paths = {}

/*
    .whileWaiting() hook
    .waitOn() hook
    .waitOnResources() hook
    .endWaiting() hook
    .data() hook
    .onNoData() hook
    .triggersEnter() hooks
    .action() hook
    .triggersExit() hooks
 */
function createRoute (routeDef, onError) {
  return {
    name: routeDef.key,
    whileWaiting () {
      // we render by default a "loading" template if the Template has not been loaded yet
      // which can be explicitly prevented by switching showLoading to false
      if (!Template[routeDef.template] && routeDef.showLoading !== false) {
        // const title = routeDef.label && translate(routeDef.label)
        this.render(routeDef.target, _loadingTemplate)
      }
    },
    waitOn () {
      return Promise.all([
        Promise.resolve(routeDef.load()),
        new Promise((resolve) => {
          Tracker.autorun((computation) => {
            const loadComplete = !Meteor.loggingIn()
            if (loadComplete) {
              computation.stop()
              resolve()
            }
          })
        })
      ])
    },
    triggersEnter: routeDef.triggersEnter && routeDef.triggersEnter(),
    action (params, queryParams) {
      // if we have loaded the template but it is not available
      // on the rendering pipeline through Template.<name> we
      // just skip the action and wait for the next rendering cycle
      if (!Template[routeDef.template]) {
        console.warn(`Found rendering attempt on unloaded Template [${routeDef.template}]`)
        return
      }

      // run custom actions to run at very first,
      // for example to scroll the window to the top
      // or prepare the window environment otherwise
      if (routeDef.onAction) {
        routeDef.onAction(params, queryParams)
      }

      const data = routeDef.data || {}
      data.params = params
      data.queryParams = queryParams

      const label = translate(routeDef.label)
      document.title = `${_titlePrefix} ${label}`

      // in rare cases the label is not yet available, so we re-assign in .5sec
      if (label.includes('.')) {
        setTimeout(() => {
          const updatedLabel = translate(routeDef.label)
          document.title = `${_titlePrefix} ${updatedLabel}`
        }, 500)
      }

      try {
        this.render(routeDef.target, routeDef.template, data)
      }
      catch (e) {
        if (typeof onError === 'function') {
          onError(e)
        }
      }
    }
  }
}

Router.register = function (routeDefinition, onError) {
  const path = routeDefinition.path()
  paths[path] = routeDefinition
  const routeInstance = createRoute(routeDefinition, onError)
  return FlowRouter.route(path, routeInstance)
}

Router.helpers = {
  isActive (name) {
    return RouterHelpers.name(name)
  }
}
