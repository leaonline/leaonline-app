import React, { useEffect, useState } from 'react'
import { callMeteor } from '../../../meteor/call'
import { Loading } from '../../../components/Loading'
import { useTts } from '../../../components/Tts'
import { ErrorMessage } from '../../../components/ErrorMessage'
import { createStyleSheet } from '../../../styles/createStyleSheet'

export const RequestRestoreCodes = props => {
  const [codes, setCodes] = useState([])
  const [error, setError] = useState(null)
  const { Tts } = useTts()

  useEffect(() => {
    const call = async () => {
      if (!codes?.length) {
        const restore = await callMeteor({ name: 'users.methods.getCodes', args: {} })
        setCodes(restore.split('-')) // TODO config via env
      }
    }
    call().catch(e => setError(e))
  }, [])

  if (error) {
    return (<ErrorMessage error={error} />)
  }

  if (!codes?.length) {
    return (<Loading />)
  }
  return codes.map((code, index) => {
    const text = code.split('').join(' ')
    return (<Tts key={code} align='center' block fontStyle={styles.code} text={text} />)
  })
}

const styles = createStyleSheet({
  code: {
    fontWeight: 'bold',
    fontSize: 44,
    height: '100%',
    lineHeight: 60
  }
})
