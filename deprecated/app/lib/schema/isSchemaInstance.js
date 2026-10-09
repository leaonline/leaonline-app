import SimpleSchema from 'simpl-schema'
import { isDefined } from '../utils/object/isDefined'

export const isSchemaInstance = target => isDefined(target) && target.constructor === SimpleSchema
