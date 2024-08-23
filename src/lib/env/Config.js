/* global __DEV__ */
import settings from '../settings.json'

const { appToken, backend, content, log, debug, isDevelopment, isDeveloperRelease } = settings

/**
 * These are the unified application globals.
 * Any configurable system behaviour should be placed here.
 */
export const Config = {}

/**
 * We use this expo-internal to determine, whether this is development mode.
 */
Config.isDevelopment = !!(__DEV__) || !!(isDevelopment)
Config.isDeveloperRelease = () => isDeveloperRelease
Config.isTest = () => process.env.JEST_WORKER_ID !== undefined
Config.appToken = appToken
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
Config.debug.connection = debug.connection

Config.log = {}
Config.log.level = log.level
Config.log.target = log.target

/**
 * The default log level.
 */
Config.debug.logLevel = log.level
Config.debug.state = !!debug.state
Config.debug.sync = !!debug.sync
Config.debug.home = !!debug.home
Config.debug.map = !!debug.map
Config.debug.unit = !!debug.unit
Config.debug.tts = !!debug.tts
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
Config.methods.restoreUser = backend.methods.users.restore
Config.methods.getMapData = backend.methods.content.map
Config.methods.getUnitData = backend.methods.content.session
Config.methods.getUnitDev = backend.methods.content.unit
Config.methods.getProgress = backend.methods.progress.get
Config.methods.updateSession = backend.methods.session.update
Config.methods.submitResponse = backend.methods.response.submit
Config.methods.getTerms = backend.methods.terms.get
Config.methods.getDevData = backend.methods.dev.get
Config.methods.getSyncDoc = 'syncState.methods.getHashes'
Config.methods.getSyncDocsForContext = 'syncState.methods.getDocs'
Config.methods.sendError = backend.methods.sendError
Config.methods.sendUnitSetAppraisal = backend.methods.appraisal.unitSet

/**
 * This configures the connection behaviour with the backend server.
 */
Config.backend = {}
Config.backend.url = backend.url
Config.backend.reachabilityUrl = backend.reachabilityUrl
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

Config.pattern = {}
Config.pattern.unitSetCode = /\w\w_\w\d{4}/
