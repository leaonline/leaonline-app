import { useEffect, useState } from 'react'
import { callMeteor } from './call'

const methodName = 'content.methods.get'

export const loadDocs = ({ name, runArgs = [] }) => {
  const [data, setData] = useState([])
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      callMeteor({
        name: methodName,
        args: { name },
        prepare: () => setLoading(true),
        receive: () => setLoading(false),
        success: docs => {
          setTimeout(() => {
            setData(docs)
          }, 300)
        },
        failure: error => setError(error)
      })
    }, 300)
  }, runArgs)

  return { data, error, loading }
}
