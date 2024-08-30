import React, { useState } from 'react'
import { Image, Dimensions, View } from 'react-native'
import { Log } from '../../../infrastructure/Log'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Loading } from '../../Loading'
import { ContentServer } from '../../../remotes/ContentServer'
import { mergeStyles } from '../../../styles/mergeStyles'
import { Colors } from '../../../constants/Colors'
import Icon from '@expo/vector-icons/FontAwesome6'
import { useTts } from '../../Tts'
import { useTranslation } from 'react-i18next'

const win = Dimensions.get('window')
const debug = Log.create('ImageRenderer', 'debug', true)

/**
 * Renders an image by given value
 * @param props {object}
 * @param props.width {string|number}
 * @param props.value {string} url
 * @param props.style {object=} optional styles
 * @return {JSX.Element|null}
 * @constructor
 */
export const ImageRenderer = props => {
  const { Tts } = useTts()
  const { t } = useTranslation()
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
      if (props.onError) { props.onError(error) }
    },
    onLoadEnd: event => {
      debug('load end from', urlReplaced)
      setTimeout(() => setLoadComplete(true), 300)
      if (props.onLoaded) { props.onLoaded() }
    },
    // other potential events:
    // onLayout: event => console.debug('layout', event.nativeEvent),
    // onProgress:event => console.debug('progress', event.nativeEvent),
    style: mergeStyles(styles.image, { width: win.width * widthRatio }, props.style),
    resizeMethod: 'auto'
  }

  const loader = () => loadComplete
    ? null
    : (<Loading />)

  return (
    <View style={styles.imageContainer}>
      {loader()}
      {error
        ? (
          <View style={styles.fallback}>
              <Tts text={t('errors.imageFailed')} color={Colors.gray} dontShowText />
              <Icon name="image" size={48} color={Colors.gray} />
          </View>
        )
        : (<Image {...imageProps} accessibilityRole='image' resizeMode='center' />)
      }
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
  },
  fallback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.gray
  }
})
