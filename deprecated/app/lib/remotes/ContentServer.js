import { Config } from '../env/Config'

export const ContentServer = {}

/**
 * Cleans a given url, especially if this has been "accidentally"
 * hardcoded or contains invalid pattern.
 * Yes, this can happen even to experienced engineers...
 * @param url {string}
 * @return {string}
 */
ContentServer.cleanUrl = (url) => {
  // cleaning is not applied if the settings contains no
  // replace-url, which is interpreted as
  // "the url is good as it is right now"
  if (Config.content.replaceUrl) {
    return url.replace(Config.content.replaceUrl, Config.content.url)
  }

  return url
}
