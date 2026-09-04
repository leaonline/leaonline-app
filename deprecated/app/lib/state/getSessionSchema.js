export const getSessionSchema = () => {
  return {
    field: {
      type: 'document',
      schema: {
        _id: String,
        title: String
      }
    },
    loadUserData: {
      type: 'scalar',
      schema: {
        value: Boolean
      }
    },
    stage: {
      type: 'document',
      isArray: true,
      schema: {
        _id: String,
        code: String,
        competencies: Number,
        dimension: String,
        progress: Number,
        userCompetencies: Number,
        userProgress: Number
      }
    },
    dimension: {
      type: 'scalar',
      schema: {
        value: String
      }
    },
    unitSet: {
      type: 'document',
      schema: {
        _id: String
      }
    },
    progress: {
      type: 'scalar',
      schema: {
        value: Number
      }
    },
    unit: {
      type: 'scalar',
      schema: {
        value: String
      }
    },
    unitId: {
      type: 'scalar',
      schema: {
        value: String
      }
    },
    page: {
      type: 'scalar',
      schema: {
        value: Number
      }
    },
    competencies: {
      type: 'document',
      schema: {
        max: Number,
        count: Number,
        scored: Number,
        percent: Number
      }
    }
  }
}

// ['screen', 'field', 'stage', 'dimension', 'unitSet', 'unit', 'page', 'progress', 'response', 'competencies', 'loadUserData', 'unitId']
