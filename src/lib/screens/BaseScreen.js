import React from 'react'
import { Loading } from '../components/Loading'
import { SafeAreaView } from 'react-native'
import { ErrorMessage } from '../components/ErrorMessage'
import { LinearProgress } from 'react-native-elements'
import { Colors } from '../constants/Colors'

/**
 *
 * @component
 * @param props {object}
 * @param props.loading {boolean}
 * @param props.style {object=}
 * @param props.error {Error=}
 * @param props.data {*=}
 * @param props.progress {number=}
 * @param props.loadMessage {string}
 * @return {JSX.Element}
 */
const RenderScreenBase = (props) => {
  if (props.loading) {
    return (
      <SafeAreaView style={props.style}>
        <Loading text={props.loadMessage} />
        {linearProgress(props.progress)}
      </SafeAreaView>
    )
  }

  if (props.error) {
    return (
      <SafeAreaView style={props.style}>
        <ErrorMessage error={props.error} />
      </SafeAreaView>
    )
  }

  const nodata = props.data === null || props.data === undefined
  const loadFailed = !props.loading && nodata

  if (loadFailed) {
    return (
      <SafeAreaView style={props.style}>
        <ErrorMessage error={new Error('screenBase.notData')} />
      </SafeAreaView>
    )
  }

  return (<SafeAreaView style={props.style}>{props.children}</SafeAreaView>)
}

const linearProgress = progress => {
  if (typeof progress !== 'number') {
    return null
  }

  return (
    <LinearProgress color={Colors.primary} value={progress} variant='determinate' />
  )
}

export const ScreenBase = React.memo(RenderScreenBase)
