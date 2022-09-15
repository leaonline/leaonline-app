import Constants from 'expo-constants'
import settings from '../settings.json'

const { backend, content, log, debug } = settings

/**
 * These are the unified application globals.
 * Any configurable system behaviour should be placed here.
 */
export const Config = {}

/**
 * We use this expo-internal to determine, whether this is development mode.
 */
Config.isDevelopment = Constants.manifest.packagerOpts?.dev

/**
 * There are multiple debug options.
 * This is contrary to the "classic" debugging approach, where the app is run with environment varibles
 * and string names of the targets to debug.
 * Instead of this, we want to be explicit and place debuggable components as properties of this object.
 */
Config.debug = {}

/**
 * If this returns true, then every UI element that can render borders will render a solid red border.
 * This is useful, if you want to debug positioning, padding and margin or flex layout.
 */
Config.debug.layoutBorders = debug.layoutBorders

/**
 * The default log level.
 */
Config.debug.logLevel = log.level

/**
 *
 */
Config.debug.map = false
Config.debug.unit = false

/**
 * Global styles.
 */
Config.styles = {}
Config.styles.containerMargin = 30

/**
 * These are the names and definitions for the server method endpoints.
 */
Config.methods = {}

/**
 *
 * @type {number}
 */
Config.methods.defaultTimeout = backend.methods.defaultTimeout

Config.methods.createUser = backend.methods.users.create
Config.methods.deleteUser = backend.methods.users.delete
Config.methods.getHomeData = backend.methods.content.home
Config.methods.getMapData = backend.methods.content.map
Config.methods.getUnitData = backend.methods.content.unit
Config.methods.getProgress = backend.methods.progress.get
Config.methods.updateSession = backend.methods.session.update
Config.methods.submitResponse = backend.methods.response.submit

/**
 * This configures the connection behaviour with the backend server.
 */
Config.backend = {}
Config.backend.url = backend.url
Config.backend.maxTimeout = backend.maxTimeout
Config.backend.interval = backend.interval

/**
 * This configures the connection behaviour with the content server.
 */
Config.content = {}
Config.content.url = content.url

/**
 * This is dev only, overrides hard-coded URLs with the local ip based url.
 */
Config.content.replaceUrl = content.replaceUrl
