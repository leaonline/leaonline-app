import Constants from 'expo-constants'

const debugLayoutBorders = true

export const Config = {}

Config.isDevelopment = Constants.manifest.packagerOpts?.dev

Config.debug = {}

Config.debug.layoutBorders = () => debugLayoutBorders
Config.debug.logLevel = 0

// data structure
Config.debug.map = true
Config.debug.unit = true

// Default values for GlobalStyles

Config.styles = {}

Config.styles.containerMargin = 30

Config.methods = {}

Config.methods.createUser = 'users.methods.create'
Config.methods.deleteUser = 'users.methods.delete'

Config.backend = {}
Config.backend.url = Constants.manifest.extra.backend.url
Config.backend.maxTimeout = Constants.manifest.extra.backend.maxTimeout
Config.backend.interval = Constants.manifest.extra.backend.interval

Config.content = {}
Config.content.url = Constants.manifest.extra.content.url
Config.content.replaceUrl = Constants.manifest.extra.content.replaceUrl
