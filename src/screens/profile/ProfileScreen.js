import React from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import { AccountInfo } from './AccountInfo'
import { Achievements } from './Achievements'

/**
 *  TODO
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ProfileScreen = () => {
  return (
    <SafeAreaView>
      <ScrollView>
        <Achievements />
        <AccountInfo />
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
