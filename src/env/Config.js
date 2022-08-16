import Constants from 'expo-constants'
import settings from '../settings.json'

const { backend, content } = settings
const debugLayoutBorders = false

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
Config.backend.url = backend.url
Config.backend.maxTimeout = backend.maxTimeout
Config.backend.interval = backend.interval

Config.content = {}
Config.content.url = content.url
Config.content.replaceUrl = content.replaceUrl
