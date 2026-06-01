import { Meteor } from 'meteor/meteor'
import { SHA256 } from 'meteor/sha'
import { sendError } from '../../contexts/errors/api/sendError'
import { fatal } from '../../ui/components/fatal/fatal'

export const initializeTTS = async () => {
  let TTSEngine
  try {
    const ttsmodule = await import('../../api/tts/TTSEngine')
    TTSEngine = ttsmodule.TTSEngine
  } catch (e) {
    console.error(e)
  }
  const mode = TTSEngine.modes.server

  console.debug('[initializeTTS]: configure TTS in mode', mode)
  return await new Promise((resolve) => {
    TTSEngine.configure({
      loader: externalServerTTSLoader,
      mode: mode,
      globalErrorHandler: error => {
        console.error(error)
        sendError({ error })
      },
      onError: err => {
        const error = err && err instanceof Error
          ? err
          : new Meteor.Error('tts.failed', 'tts.initFailed', err)
        console.error('[initializeTTS]: configure failed => ', error.message)
        // TODO communicate error to user in an understandable way
        // TODO fallback to server-rendered TTS
        fatal({
          error: {
            message: 'tts.failed',
            original: error.message
          }
        })

        sendError({ error })
        resolve(TTSEngine)
      },
      onComplete () {
        console.debug('[initializeTTS]: configure complete')
        TTSEngine.defaults({ rate: 0.8 })
        resolve(TTSEngine)
      }
    })
  })
}

function externalServerTTSLoader (requestText, callback) {
  // TODO uncomment when ServerTTS is available
  const url = 'http://localhost:3030/speech' // Meteor.settings.public.tts.url
  const hash = '85bde9708cfe0c44b3ccf1950f0618341704948583d213d5ef27eaad37474d7d' // SHA256(requestText)
  const options = {
    params: { hash },
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }

  HTTP.get(url, options, (err, res) => {
    if (err) {
      sendError({ error: err })
      return callback(err)
    }

    callback(undefined, res?.data)
  })
}
