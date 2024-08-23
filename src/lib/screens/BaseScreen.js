import React, { useCallback } from 'react'
import { Loading } from '../components/Loading'
import { RefreshControl, SafeAreaView, ScrollView } from 'react-native'
import { ErrorMessage } from '../components/ErrorMessage'
import { LinearProgress } from 'react-native-elements'
import { Colors } from '../constants/Colors'
import { createStyleSheet } from '../styles/createStyleSheet'
import { Layout } from '../constants/Layout'
import { Log } from '../infrastructure/Log'

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
 * @param props.onRefresh {function?}
 * @return {JSX.Element}
 */
const RenderScreenBase = (props) => {
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await props.onRefresh()
    } catch (e) {
      Log.error(e)
    }
    setRefreshing(false)
  }, [props.onRefresh])

  if (props.loading) {
    return (
      <SafeAreaView style={props.style}>
        <Loading text={props.loadMessage}/>
        {linearProgress(props.progress)}
      </SafeAreaView>
    )
  }

  if (props.error) {
    return (
      <SafeAreaView style={props.style}>
        <ScrollView
          refreshControl={
            props.onRefresh && <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
          }
          contentContainerStyle={styles.scrollContainer}>
          <ErrorMessage error={props.error}/>
        </ScrollView>
      </SafeAreaView>
    )
  }

  const nodata = props.data === null || props.data === undefined
  const loadFailed = !props.loading && nodata

  if (loadFailed) {
    return (
      <SafeAreaView style={props.style}>
        <ScrollView
          refreshControl={
            props.onRefresh && <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
          }
          contentContainerStyle={styles.scrollContainer}>
          <ErrorMessage error={new Error('screenBase.notData')}/>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (<SafeAreaView style={props.style}>{props.children}</SafeAreaView>)
}

const styles = createStyleSheet({
  scrollContainer: {
    ...Layout.container(),
    flexGrow: 1,
    flex: 0
  }
})

const linearProgress = progress => {
  if (typeof progress !== 'number') {
    return null
  }

  return (
    <LinearProgress color={Colors.primary} value={progress} variant="determinate"/>
  )
}

export const ScreenBase = React.memo(RenderScreenBase)
