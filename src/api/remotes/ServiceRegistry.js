import { ServiceRegistry } from 'meteor/leaonline:service-registry'

// make sure we can call without app token
ServiceRegistry.methods.get.backend = true

/**
 * For documentation see {@link https://github.com/leaonline/service-registry}
 * @category api
 * @namespace
 */
export { ServiceRegistry }
