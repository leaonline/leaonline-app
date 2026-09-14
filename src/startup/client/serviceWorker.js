import { Meteor } from 'meteor/meteor'

// see https://github.com/NitroBAY/meteor-service-worker
Meteor.startup(() => {
  if (!navigator.serviceWorker) {
    return console.warn('[serviceWorker]: not found, skipped')
  }

  // absence of service worker is not a fatal error so we continue silently
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => console.info('[serviceWorker]: registered successfully'))
    .catch(error => console.warn('[serviceWorker]: registration failed: ', error))
})
