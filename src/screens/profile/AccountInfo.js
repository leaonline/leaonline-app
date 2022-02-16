import React, { useState } from 'react'
import { View, Modal } from 'react-native'
import { TTSengine } from '../../components/Tts'
import { currentUser } from '../../meteor/currentUser'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../components/ActionButton'

/**
 * @private
 */
const Tts = TTSengine.component()

/**
 * Displays information and provides functionality about the user's account:
 *
 * - restore codes
 * - delete account
 * - soft-delete (dev-only)
 *
 * @return {*}
 * @constructor
 */
export const AccountInfo = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const { t } = useTranslation()
  const user = currentUser()

  const renderCodes = () => {
    if (!user?.restore) {
      return (<View />)
    }
    return user.restore.map((code, index) => {
      return (
        <View key={`restore-code-${index}`}>
          <Tts speed={0.4} text={code.split('').join(' ')} />
        </View>
      )
    })
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <ActionButton text={t('accountInfo.restoreCodes')} onPress={() => setModalVisible(true)} />
      <Modal
        animationType='slide'
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          console.debug('Modal has been closed.')
          setModalVisible(!modalVisible)
        }}
      >
        <View style={{ alignItems: 'center' }}>
          {renderCodes()}
        </View>

        <ActionButton text={'X ' + t('actions.close')} onPress={() => setModalVisible(!modalVisible)} />
      </Modal>
    </View>
  )
}
