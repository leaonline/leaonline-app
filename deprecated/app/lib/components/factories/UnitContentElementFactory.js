import React from 'react'
import { Log } from '../../infrastructure/Log'
import { LeaText } from '../LeaText'

const debug = Log.create('UnitContentElementFactory', 'debug')

/**
 * Registers a content element renderer to be invoked by the factory
 * @component
 * @category Components
 * @type {object}
 * @class
 * @hideconstructor
 */
export const UnitContentElementFactory = {}

const components = new Map()
const toKey = ({ type, subtype }) => `${type}-${subtype}`

/**
 * @param type
 * @param subtype
 * @param component
 * @method
 */
UnitContentElementFactory.register = ({ type, subtype, component }) => {
  const key = toKey({ type, subtype })
  components.set(key, component)
}

/**
 * Removes all registered renderer.
 */
UnitContentElementFactory.flush = () => components.clear()

/**
 * Returns, whether a renderer is registered
 * @param options {object}
 * @param options.type {string}
 * @param options.subtype {string}
 * @return {boolean}
 */
UnitContentElementFactory.isRegistered = (options) => components.has(toKey(options))

/**
 * Returns a registered renderer by given type/subtype. If none is found, returns a fallback.
 * @param props {object}
 * @param props.type {string} the content type
 * @param props.subtype {string} the content subtype
 * @returns {JSX.Element}
 * @component
 */
UnitContentElementFactory.Renderer = props => {
  const accessKey = toKey(props)
  const component = components.get(accessKey)
  debug('render', props.uid, accessKey, component)

  if (component) {
    return component(props)
  }

  return fallback(props)
}

/**
 * Render fallback if an unknown Renderer has been requested.
 * @private
 * @param props
 * @return {JSX.Element}
 */
const fallback = props => (
  <React.Fragment key={props.key}>
    <LeaText>Fallback: {props.type} / {props.subtype}</LeaText>
  </React.Fragment>
)

/**
 * Use-hook to retrieve the Renderer component
 * @return {{Renderer: UnitContentElementFactory.Renderer }}
 */
export const useContentElementFactory = () => ({ Renderer: UnitContentElementFactory.Renderer })
