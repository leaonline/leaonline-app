import { runRateLimiter } from '../infrastructure/factories/rateLimit'
import { Meteor } from 'meteor/meteor'
import { ServerErrors } from '../contexts/errors/ServerErrors'

Meteor.startup(() => {
  runRateLimiter(function callback (reply, input) {
    if (reply.allowed) {
      return undefined
    }
    else {
      console.warn('[RateLimiter]: rate limit exceeded')
      console.warn(reply)
      console.warn(input)
      const details = { ...reply, ...input }
      const isMethod = data.name.includes('methods')
      const reason = isMethod
        ? 'rateLimit.method.tooManyRequests'
        : 'rateLimit.publication.tooManyRequests'

      ServerErrors.handle({
        error: new Meteor.Error('errors.rateLimitExceeded', reason, details),
        userId: input.userId,
        name: input.name
      })
    }
  }, false, false)
})
