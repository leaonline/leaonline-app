import React from 'react'
import { SafeAreaView, ScrollView, View, Button } from 'react-native'

import { TTSengine } from '../../components/Tts'
import { deleteAccount } from '../../meteor/deleteAccount'
import { ActionButton } from '../../components/ActionButton'
import { AccountInfo } from './AccountInfo'
import { Achievements } from './Achievements'
import { Log } from '../../infrastructure/Log'

const Tts = TTSengine.component()

/**
 *  TODO
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const ProfileScreen = () => {
  const deleteMeteorAccount = () => {
    const log = Log.create('deleteMeteorAccount')

    deleteAccount({
      prepare: () => log('send delete request'),
      receive: () => log('response receive'),
      success: () => log('successful deleted'),
      failure: error => Log.error(error)
    })
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <Achievements />
        <AccountInfo />
        <ActionButton text='löschen' onPress={deleteMeteorAccount} />
        <View>
          <Tts text='Account löschen' id='delete account' />
          <Button
            onPress={deleteMeteorAccount}
            title='Account löschen'
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen
