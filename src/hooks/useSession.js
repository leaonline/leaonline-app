import { useEffect, useState } from 'react'
import { AppState } from '../state/AppState'

const initialState = {
  field: null
}

const reducer = (prev, next) => {
  switch (next.type) {
    case 'field':
      return {
        ...prev,
        field: next.field
      }
  }
}

export const useSession = () => {
  const [field, setField] = useState(null)

  const updateField = async (value) => {
    console.debug('updateField', value)
    setField(value)

    try {
      await AppState.field(value)
    } catch (e) {
      // TODO log
      console.error(e)
    }
  }

  return { field, updateField }
}
