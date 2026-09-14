import { Meteor } from 'meteor/meteor'
import { SHA256 } from 'meteor/sha'
import { sendError } from '../../contexts/errors/api/sendError'
import { fatal } from '../../ui/components/fatal/fatal'
import { noop } from '../../utils/noop'

const MAX_SERVER_RETRIES = Meteor.settings.public.tts.maxRetries ?? -1
const TTS_URL = Meteor.settings.public.tts.url

/**
 * Initializes the TTS engine with a dual configuration and gradual fallback workflow.
 *
 * 1. Setup server tts and provide a global error handler
 * 2. if server tts fails (e.g. audio is not available) then fallback to browser tts
 * 3. if browser tts is not yet configured, then configure/load it
 * 4. if browser tts fails - raise fatal error
 * 5. once browser tts completes, reset to server tts, unless a maxRetries counter is set and exceedd
 *
 * @param debug
 * @return {Promise<unknown>}
 */
export const initializeTTS = async (debug = noop) => {
    const { TTSEngine } = await import('../../api/tts/TTSEngine')
    const mode = TTSEngine.modes.server
    debug('[initializeTTS]: configure TTS in mode', mode)

    // local counter for server fails, only relevant if
    // max retries is >= 0
    let serverFails = 0

    // passed to both server and browser tts config
    // where its automatically called if any tts process fails
    const globalErrorHandler = (error) => {
        const handler = errorHandlers[TTSEngine.mode]
        if (handler) return handler(error)
        debug('[initializeTTS]: globalErrorHandler fallback', error)
    }

    // open-close implementation of global error handlers
    const errorHandlers = {
        /**
         * if server tts fails, this handler is automatically called
         */
        [TTSEngine.modes.server]: (error) => {
            debug(`[ServerTTSLoader]: failed ${++serverFails} times`, error)
            return browserFallback({
                TTSEngine,
                debug,
                onComplete() {
                    TTSEngine.replay()
                    // always reset to server, if max retries are infinite or current retries are below max
                    if (MAX_SERVER_RETRIES < 0 || serverFails <= MAX_SERVER_RETRIES) {
                        debug(
                            `reset to ${TTSEngine.modes.server} (${serverFails}/${MAX_SERVER_RETRIES})`,
                        )
                        TTSEngine.mode = TTSEngine.modes.server
                    }
                },
                onError: (err) => {
                    fatal({
                        error: {
                            message: 'tts.failed',
                            original: err.message,
                        },
                    })
                },
            })
        },
        [TTSEngine.modes.browser]: (error) => {
            console.error(error)
            // fall back to browser if we used server mode
            fatal({
                error: {
                    message: 'tts.failed',
                    original: error.message,
                },
            })
            sendError({ error })
        },
    }

    /**
     * This is called when the servertts fails in order to attempt to load tts using
     * the browser builtin tts services. Some browsers do not support
     * tts, which is why the error handler will then pipe into a fatal error,
     * displaying a dialog to inform the user about it
     * @param TTSEngine
     * @param debug
     * @param onComplete
     */
    const browserFallback = ({ TTSEngine, debug, onComplete }) => {
        debug('[initializeTTS]: fallback to mode', TTSEngine.modes.browser)
        TTSEngine.configure({
            debug,
            loader: externalServerTTSLoader,
            mode: TTSEngine.modes.browser,
            globalErrorHandler,
            onError: (err) => {
                const error =
                    err && err instanceof Error
                        ? err
                        : new Meteor.Error('tts.failed', 'tts.initFailed', err)
                console.error('[initializeTTS]: configure failed => ', error.message)
                fatal({
                    error: {
                        message: 'tts.failed',
                        original: error.message,
                    },
                })
                sendError({ error })
            },
            onComplete() {
                debug('[initializeTTS]: fallback complete')
                onComplete()
            },
        })
    }

    function externalServerTTSLoader(requestText, callback, debug = noop) {
        debug(`[ServerTTSLoader]: request for text "${requestText}"`)
        const hash = SHA256(requestText)
        return callback(null, `${TTS_URL}?hash=${hash}`)
    }

    return new Promise((resolve) => {
        TTSEngine.configure({
            debug,
            loader: externalServerTTSLoader,
            mode: mode,
            globalErrorHandler,
            onError: (err) => {
                const error =
                    err && err instanceof Error
                        ? err
                        : new Meteor.Error('tts.failed', 'tts.initFailed', err)
                console.error('[initializeTTS]: configure failed => ', error.message)
                // TODO communicate error to user in an understandable way
                // TODO fallback to server-rendered TTS
                fatal({
                    error: {
                        message: 'tts.failed',
                        original: error.message,
                    },
                })

                sendError({ error })
                resolve(TTSEngine)
            },
            onComplete() {
                debug('[initializeTTS]: configure complete')
                TTSEngine.defaults({ rate: 0.8 })
                resolve(TTSEngine)
            },
        })
    })
}
