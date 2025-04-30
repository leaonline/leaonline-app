import React from 'react'
import { View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Layout } from '../../constants/Layout'
import { Colors } from '../../constants/Colors'
import { LinearProgress } from 'react-native-elements'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'

/**
 * Sync screen displays a loading progress and
 * a message to users whike syncing data from server
 * @param complete {boolean}
 * @param progress {number}
 * @returns {JSX.Element}
 * @constructor
 */
export const SyncScreen = ({ complete, progress }) => {
  const { Tts } = useTts()
  const { t } = useTranslation()

  const message = complete
    ? t('syncScreen.synced')
    : t('syncScreen.syncing')
  return (
    <View style={styles.container}>
      <Tts text={message} block={false} />
      <LinearProgress
        value={progress}
        variant={complete || progress > 0 ? 'determinate' : 'indeterminate'}
        color={complete ? Colors.success : Colors.primary}
      />
    </View>
  )
}

const styles = createStyleSheet({
  container: {
    ...Layout.container(),
    alignItems: 'center',
    justifyContent: 'center'
  }
})
