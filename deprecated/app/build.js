const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const info = (...args) => console.info('[BUILD]', ...args)
let BUILD_PROFILE = 'preview'
let BUILD_LOCAL = false

process.argv
  .forEach(function (val, index, array) {
    if (val.startsWith('--type')) {
      BUILD_PROFILE = val.split(/[=\s]+/)[1]
    }
    if (val.includes('--local')) {
      BUILD_LOCAL = true
    }
  })

info('use profile', BUILD_PROFILE)
info('use local?', BUILD_LOCAL)

const SETTINGS_PATH = path.join(process.cwd(), ((type) => {
  switch (type) {
    case 'staging':
      return '.deploy/settings.staging.json'
    case 'production':
      return '.deploy/settings.production.json'
    default:
      throw new Error(`Unknown build profile: ${type}`)
  }
})(BUILD_PROFILE))
info('settings path is', SETTINGS_PATH)

const SETTINGS_DESTINATION = path.resolve('settings/settings.json')
info('settings destination', SETTINGS_DESTINATION)
const ORIGINAL_SETTINGS = fs.readFileSync(SETTINGS_DESTINATION)
info('original settings', ORIGINAL_SETTINGS.length)
const SETTINGS_SRC = fs.readFileSync(SETTINGS_PATH)
info('settings src', SETTINGS_SRC.length)

const recoverSettings = () => {
  fs.writeFileSync(SETTINGS_DESTINATION, ORIGINAL_SETTINGS)
}

const attempt = (name, fn) => {
  info('attempt', name)
  try {
    return fn()
  }
  catch (e) {
    console.error(e)
    recoverSettings()
    process.exit(1)
  }
}

attempt('replace settings', () => fs.writeFileSync(SETTINGS_DESTINATION, SETTINGS_SRC))
attempt('run build pipeline', () => {
  const args = ['eas', 'build', '--platform', 'android', '--profile', BUILD_PROFILE]
  if (BUILD_LOCAL) args.push('--local')
  spawnSync('npx', args, { stdio: 'inherit' })
  recoverSettings()
})
