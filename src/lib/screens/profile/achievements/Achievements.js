import React, { useReducer, useState } from 'react'
import { View } from 'react-native'
import { LinearProgress, ListItem, Icon } from 'react-native-elements'
import Colors from '../../../constants/Colors'
import { useTranslation } from 'react-i18next'
import profileData from '../../../resources/profileData'
import { useTts } from '../../../components/Tts'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { mergeStyles } from '../../../styles/mergeStyles'
import { loadDocs } from '../../../meteor/loadDocs'
import { loadAchievementsData } from './loadAchievementsData'
import { ScreenBase } from '../../BaseScreen'
import Tts from 'react-native-tts'
import { Layout } from '../../../constants/Layout'
import { DimensionAchievements } from './DimensionAchievements'

/**
 * Displays the user's achievements for
 * all given dimensions and the overall
 * progress.
 *
 * @return {*}
 * @constructor
 */
export const Achievements = (props) => {
  const { t } = useTranslation()
  const { Tts } = useTts()
  const docs = loadDocs({
    fn: () => loadAchievementsData()
  })

  const ready = docs?.data?.dimensions?.length && docs?.data?.fields?.length
  const containerStyle = mergeStyles(styles.container, props.containerStyle)
  return (
    <ScreenBase {...docs} style={containerStyle}>
      {ready && (<DimensionAchievements {...docs?.data} />)}
      <View style={styles.headline}>
        <Tts
          text={t('profileScreen.progress')}
          color={Colors.primary}
          fontStyle={styles.headlineText}
          id="profileScreen.progress"/>
      </View>
      <View style={styles.headline}>
      <LinearProgress
        color={Colors.primary}
        variant="determinate"
        value={profileData.progress.global}
        style={styles.globalProgress}/>
      </View>
    </ScreenBase>
  )
}



/**
 * @private stylesheet
 */
const styles = createStyleSheet({
  container: {
    ...Layout.container({ margin: 0 }),
    flex: 0,
    justifyContent: 'flex-start',
  },
  headline: {
    alignItems: 'center',
    fontWeight: 'bold',
    marginTop: 15
  },
  globalProgress: {
    borderRadius: 15,
    height: 15,
    width: '65%'
  }
})
