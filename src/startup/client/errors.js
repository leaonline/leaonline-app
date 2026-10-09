import { Meteor } from 'meteor/meteor'
import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { sendError } from '../../contexts/errors/api/sendError'

const parseAndSendError = ({ error }) => {
  const instance = Template.instance()
  const templateName = instance
    ? instance.viewName ?? instance.view?.name ?? 'unknown'
    : 'unknown'
  sendError({
    userId: Meteor.userId(),
    template: templateName,
    error
  })
}

// to log internal blaze errors we setup this exception handler
// and transform their internal error into something we can use
Blaze._reportException = function (e, msg) {
  if (Blaze._throwNextException) {
    Blaze._throwNextException = false
    throw e
  }
  console.error(msg, e)
}

// we also want to log any error that occurs on the window level
window.onerror = function (event, source, lineno, colno, error) {
  if (!event.isTrusted) {
    return console.error('untrusted event raised', event)
  }
  const message = typeof event === 'object'
    ? event.message
    : event
  const details = { message, source, lineno, colno }
  error.details = Object.assign({}, error.details, details)
  parseAndSendError({ error })
}

// CSP errors need to be logged as well
Template.body.onCreated(function () {
  document.addEventListener('securitypolicyviolation', (securityViolationEvent) => {
    if (!securityViolationEvent.isTrusted) {
      return console.error('untrusted event raised', securityViolationEvent)
    }

    const error = new Error('securitypolicyviolation')
    error.details = {
      blockedURI: securityViolationEvent.blockedURI,
      violatedDirective: securityViolationEvent.violatedDirective,
      columnNumber: securityViolationEvent.columnNumber,
      documentURI: securityViolationEvent.documentURI,
      effectiveDirective: securityViolationEvent.effectiveDirective,
      lineNumber: securityViolationEvent.lineNumber,
      referrer: securityViolationEvent.referrer,
      sample: securityViolationEvent.sample,
      sourceFile: securityViolationEvent.sourceFile,
      statusCode: securityViolationEvent.statusCode
    }
    parseAndSendError({ error })
  })

  document.fonts.addEventListener('loadingerror', (event) => {
    if (!event.isTrusted) {
      return console.error('untrusted event raised', event)
    }
    const error = new Error('loadingerror')
    error.details = {
      fonts: event.fontfaces.map(font => ({
        family: font.family,
        reason: font.loaded?.reason?.message
      }))
    }
    parseAndSendError({ error })
  })
})
