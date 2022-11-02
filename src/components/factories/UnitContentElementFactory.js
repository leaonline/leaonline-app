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
 * Returns a registered renderer by given type/subtype. If none is found, returns a fallback.
 * @param props {object}
 * @param props.type {string} the content type
 * @param props.subtype {string} the content subtype
 * @returns {JSX.Element}
 * @constructor
 * @component
 */
UnitContentElementFactory.Renderer = props => {
  const key = toKey(props)
  const component = components.get(key)
  debug('render', key, !!component)

  if (component) {
    return component(props)
  }

  return fallback(props)
}

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
