import { getCollection } from '../../api/utils/getCollection'
import { UnitSet } from '../content/UnitSet'
import { ensureDocument } from '../../api/utils/ensureDocument'
import { onDependencies } from '../utils/onDependencies'
import { Field } from '../content/Field'
import { Dimension } from '../content/Dimension'

export const UnitSetAppraisal = {
  name: 'unitSetAppraisal',
  label: 'unitSetAppraisal.title',
  icon: 'thumbs-up'
}

UnitSetAppraisal.schema = {
  createdAt: {
    type: Date
  },
  userId: {
    type: String
  },
  fieldId: {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
  },
  dimensionId: {
    type: String,
    dependency: {
      collection: Dimension.name,
      field: Dimension.representative
    }
  },
  stage: {
    type: Number
  },
  unitSetId: {
    type: String,
    dependency: {
      collection: UnitSet.name,
      field: UnitSet.representative
    }
  },
  /**
   * Respnse is a likert scale, ranging from 0..5
   *
   * 0 - strongly disagree
   * 1 - disagree
   * 2 - neutral
   * 3 - agree
   * 4 - strongly agree
   */
  response: {
    type: Number,
    min: 0,
    max: 4
  }
}

UnitSetAppraisal.methods = {}

UnitSetAppraisal.methods.send = {
  name: 'unitSetAppraisal.methods.send',
  schema: {
    unitSetId: {
      type: String
    },
    stage: {
      type: Number
    },
    response: {
      type: Number
    }
  },
  run: function ({ unitSetId, stage, response }) {
    const { userId } = this
    const createdAt = new Date()
    const unitSetDoc = getCollection(UnitSet.name).findOne(unitSetId)
    ensureDocument({
      name: UnitSet.name,
      docId: unitSetId,
      document: unitSetDoc,
      details: { userId }
    })
    const fieldId = unitSetDoc.field
    const dimensionId = unitSetDoc.dimension
    const insertDoc = {
      userId,
      createdAt,
      unitSetId,
      fieldId,
      dimensionId,
      stage,
      response
    }
    return getCollection(UnitSetAppraisal.name).insert(insertDoc)
  }
}

UnitSetAppraisal.methods.getAll = {
  name: 'unitSetAppraisal.methods.getAll',
  schema: {
    dependencies: {
      type: Array,
      optional: true
    },
    'dependencies.$': {
      type: Object,
      blackbox: true,
      optional: true
    }
  },
  backend: true,
  run: function ({ dependencies } = {}) {
    const docs = getCollection(UnitSetAppraisal.name).find().fetch()
    const data = { [UnitSetAppraisal.name]: docs }

    onDependencies()
      .add(Field, 'fieldId')
      .add(Dimension, 'dimensionId')
      .add(UnitSet, 'unitSetId')
      .output(data)
      .run({ dependencies, docs })

    return data
  }
}