import { createCollection } from '../infrastructure/createCollection'
import { ContextRepository } from '../infrastructure/ContextRepository'
import { Field } from '../contexts/Field'
import { Dimension } from '../contexts/Dimension'
import { Level } from '../contexts/Level'
import { Sync } from '../infrastructure/sync/Sync'
import { Log } from '../infrastructure/Log'
import { Feedback } from '../contexts/Feedback'
import { MapIcons } from '../contexts/MapIcons'
import { Order } from '../contexts/Order'
import { Achievements } from '../contexts/Achievements'

const log = Log.create('startup')

export const initContexts = async () => {
  const allContexts = [Field, Dimension, Level, Sync, Feedback, MapIcons, Order, Achievements]

  for (const context of allContexts) {
    // in dev mode we may face the situation, where we fast-reload
    // the app and the following routines have already been executed
    // for such case we simply skip if we find the ctx in the repo
    if (ContextRepository.has(context.name)) {
      return log(context.name, 'already registered')
    }

    log(context.name, 'create collection')
    const collection = createCollection({
      name: context.name,
      isLocal: true
    })

    context.collection = () => collection

    ContextRepository.add(context.name, context)

    if (typeof context.init === 'function') {
      log(context.name, 'init')
      await context.init()
    }

    log(context.name, 'complete')
  }
}
