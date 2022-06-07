import { Config } from '../env/Config'

export const ContentServer = {}

ContentServer.cleanUrl = (url) => {
  if (Config.isDevelopment) {
    return url.replace(Config.content.replaceUrl, Config.content.url)
  }

  return url
}