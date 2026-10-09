import { Meteor } from 'meteor/meteor'
import { onClient, onServer } from '../../utils/archUtils'

export const Logos = {
  name: 'logos',
  label: 'logos.title',
  icon: 'images',
  isConfigDoc: true
}

Logos.schema = {
  footer: {
    type: Array,
    label: 'logos.footer',
    optional: false
  },
  'footer.$': {
    type: Object,
    label: 'common.entry'
  },
  'footer.$.url': {
    type: String,
    label: 'logos.logoUrl',
    isMediaUrl: true
  },
  'footer.$.title': {
    type: String,
    label: 'logos.logoTitle',
    optional: true
  },
  'footer.$.width': {
    type: Number,
    label: 'logos.width',
    optional: true
  },
  'footer.$.height': {
    type: Number,
    label: 'logos.height',
    optional: true
  },
  'footer.$.href': {
    type: String,
    label: 'logos.href',
    optional: true
  }
}

Logos.methods = {}

Logos.methods.update = {
  name: 'logos.methods.update',
  numRequests: 1,
  backend: true,
  timeInterval: 250,
  schema: Object.assign({}, Logos.schema, {
    _id: {
      type: String,
      optional: true
    }
  }),
  run: onServer(async function ({ footer }) {
    const LogoCollection = Logos.collection()
    const logoDoc = await LogoCollection.findOneAsync()
    if (!logoDoc) {
      return LogoCollection.insertAsync({ footer })
    }
    else {
      return LogoCollection.updateAsync(logoDoc._id, { $set: { footer } })
    }
  })
}

Logos.methods.get = {
  name: 'logos.methods.get',
  isPublic: true,
  numRequests: 1,
  timeInterval: 250,
  schema: {
    _id: {
      type: String,
      optional: true
    }
  },
  run: onServer(async function () {
    const doc = await Logos.collection().findOneAsync()
    return doc ?? {}
  }),
  call: onClient(function (cb) {
    Meteor.call(Logos.methods.get.name, cb)
  })
}
