export const Connect = {}

Connect.name = 'connect'
Connect.label = 'item.connect.title'
Connect.icon = 'tasks'
Connect.isItem = true

/*
Connect.schema = {
  left: {
    type: Array,
    label: 'item.connect.left'
  },
  'left.$': {
    type: Object,
    label: Labels.entry
  },
  'left.$.text': {
    type: String,
    label: Labels.text,
    optional: true
  },
  'left.$.tts': {
    type: String,
    optional: true,
    label: 'tts.text'
  },
  'left.$.image': {
    type: String,
    optional: true,
    label: 'image.title',
    dependency: {
      filesCollection: MediaLib.name,
      version: 'original',
      isImage: true
    }
  },

  right: {
    type: Array,
    label: 'item.connect.right'
  },
  'right.$': {
    type: Object,
    label: Labels.entry
  },
  'right.$.text': {
    type: String,
    label: Labels.text,
    optional: true
  },
  'right.$.tts': {
    type: String,
    optional: true,
    label: 'tts.text'
  },
  'right.$.image': {
    type: String,
    optional: true,
    label: 'image.title',
    dependency: {
      filesCollection: MediaLib.name,
      version: 'original',
      isImage: true
    }
  },

  scoring: {
    type: Array,
    label: 'scoring.title'
    // optional: true // todo remove after trial phase
  },
  'scoring.$': {
    type: Object,
    label: Labels.entry
  },
  'scoring.$.competency': {
    type: String,
    label: Competency.label,
    dependency: {
      collection: Competency.name,
      field: Competency.representative
    }
  },
  'scoring.$.requires': {
    type: Number,
    label: 'scoring.requires.title',
    allowedValues: [1, 2, 3],
    options: [
      Scoring.types.all,
      Scoring.types.any,
      Scoring.types.allInclusive
    ],
    defaultValue: 1
  },
  'scoring.$.correctResponse': {
    type: Array,
    label: 'scoring.correctResponse'
  },
  'scoring.$.correctResponse.$': {
    type: Object,
    label: Labels.entry
  },
  'scoring.$.correctResponse.$.left': {
    type: Number,
    label: 'item.connect.left',
    dependency: {
      context: null, // self
      requires: 'left',
      field: 'left',
      valueField: '@index',
      labelField: 'text'
    }
  },
  'scoring.$.correctResponse.$.right': {
    type: Number,
    label: 'item.connect.right',
    dependency: {
      context: null, // self
      requires: 'right',
      field: 'right',
      valueField: '@index',
      labelField: 'text'
    }
  }
}
*/
