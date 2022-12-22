import React, { useState } from 'react'
import { Image, Dimensions, View } from 'react-native'
import { Log } from '../../../infrastructure/Log'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Loading } from '../../Loading'
import { ContentServer } from '../../../remotes/ContentServer'

const win = Dimensions.get('window')
const debug = Log.create('ImageRenderer', 'debug', true)

export const ImageRenderer = props => {
  const [loadComplete, setLoadComplete] = useState(false)
  const urlReplaced = ContentServer.cleanUrl(props.value)
  const imageProps = {
    source: { uri: urlReplaced },
    onError: (event) => {
      debug('load failed from', urlReplaced)
      debug(event.message || event.nativeEvent || event.error)
    },
    onLoadStart: () => debug('load image from', urlReplaced),
    onLoad: () => debug('load successful from', urlReplaced),
    onLoadEnd: event => {
      debug('load end from', urlReplaced)
      setTimeout(() => setLoadComplete(true), 300)
    },

    // other potential events:
    // onLayout: event => console.debug('layout', event.nativeEvent),
    // onProgress:event => console.debug('progress', event.nativeEvent),

    style: styles.image,
    resizeMethod: 'auto'
  }

  const loader = () => loadComplete ? null : (<Loading />)

  return (
    <View style={styles.imageContainer}>
      {loader()}
      <Image {...imageProps} resizeMode='cover' />
    </View>
  )
}

const styles = createStyleSheet({
  image: {
    flex: 1,
    width: win.width,
    height: win.width / 2,
    alignSelf: 'stretch',
    resizeMode: 'cover',
    marginLeft: 40
  },
  imageContainer: {
    flexDirection: 'row'
  }
})
