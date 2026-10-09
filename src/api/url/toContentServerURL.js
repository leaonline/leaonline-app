import { Meteor } from 'meteor/meteor'
import { encodeQueryParams } from './encodeQueryParams'

const contentServer = Meteor.settings.public.hosts.content
const contentRoot = contentServer.url

/**
 * Creates a URL to a content-server resource.
 * @param path
 * @param params
 * @return {string}
 */
export const toContentServerURL = (path = '/', params) => {
  const base = new URL(`${contentRoot}${path}`)
  if (params) {
    base.search = encodeQueryParams(params)
  }
  return base.toString()
}
