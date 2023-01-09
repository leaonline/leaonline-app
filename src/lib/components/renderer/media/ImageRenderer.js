import React, { useState } from 'react'
import { Image, Dimensions, View } from 'react-native'
import { Log } from '../../../infrastructure/Log'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Loading } from '../../Loading'
import { ContentServer } from '../../../remotes/ContentServer'
import { mergeStyles } from '../../../styles/mergeStyles'
import { ErrorMessage } from '../../ErrorMessage'

const win = Dimensions.get('window')
const debug = Log.create('ImageRenderer', 'debug', true)

export const ImageRenderer = props => {
  const widthRatio = props.width
    ? Number.parseInt(props.width) / 12
    : 1
  const [loadComplete, setLoadComplete] = useState(false)
  const [error, setError] = useState(null)
  const urlReplaced = ContentServer.cleanUrl(props.value)
  const imageProps = {
    source: { uri: urlReplaced },
    onError: ({ nativeEvent: { error } }) => {
      debug('load failed from', urlReplaced)
      Log.error(error)
      setLoadComplete(true)
      setError(error)
    },
    onLoadEnd: event => {
      debug('load end from', urlReplaced)
      setTimeout(() => setLoadComplete(true), 300)
    },
    // other potential events:
    // onLayout: event => console.debug('layout', event.nativeEvent),
    // onProgress:event => console.debug('progress', event.nativeEvent),
    style: mergeStyles(styles.image, { width: win.width * widthRatio }),
    resizeMethod: 'auto'
  }

  const loader = () => loadComplete ? null : (<Loading />)

  return (
    <View style={styles.imageContainer}>
      {loader()}
      {error
        ? (<ErrorMessage error={error} />)
        : (<Image {...imageProps} resizeMode='center' />)}
    </View>
  )
}

const styles = createStyleSheet({
  image: {
    resizeMode: 'center',
    height: 250
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  }
})
