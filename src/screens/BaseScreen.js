import React from 'react'
import { Loading } from '../components/Loading'
import { SafeAreaView } from 'react-native'
import { ErrorMessage } from '../components/ErrorMessage'

export const ScreenBase = (props) => {
  if (props.loading) {
    return (
      <SafeAreaView style={props.style}>
        <Loading />
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
