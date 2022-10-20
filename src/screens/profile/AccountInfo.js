import React, { useContext, useState } from 'react'
import { View, Modal } from 'react-native'
import { TTSengine } from '../../components/Tts'
import { currentUser } from '../../meteor/currentUser'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../components/ActionButton'
import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'
import { deleteAccount } from '../../meteor/deleteAccount'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { Layout } from '../../constants/Layout'
import { AuthContext } from '../../contexts/AuthContext'

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
  const [codes, setCodes] = useState([])
  const { t } = useTranslation()
  const { signOut } = useContext(AuthContext)

  const handleSignOut = () => signOut({ onError: err => console.error(err) })
  const renderCodes = () => {
    if (!codes) { return null }
    return codes.map((code, index) => {
      const text = code.split('').join(' ')
      return (<Tts key={code} text={text} />)
    })
  }

  const requestRestoreCode = async () => {
    try {
      if (!codes) {
        const restore = await callMeteor({ name: 'users.methods.getCodes', args: {} })
        setCodes(restore.split('-')) // TODO config via env
      }
      setModalVisible(true)
    } catch (e) {
      console.error(e)
    }
  }

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
    <View style={{ alignItems: 'center' }}>
      <ActionButton text={t('accountInfo.restoreCodes')} onPress={requestRestoreCode} />
      <Modal
        animationType='slide'
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          <Tts text={t('accountInfo.whyRestore')} />
          <View style={styles.codes}>
            {renderCodes()}
          </View>
          <ActionButton icon={'times'} text={t('actions.close')} onPress={() => setModalVisible(!modalVisible)} />
        </View>
      </Modal>

      <ActionButton text='löschen' onPress={deleteMeteorAccount} />
      <ActionButton icon={'sign-out-alt'} text={t('actions.signOut')} onPress={handleSignOut} />
    </View>
  )
}

const styles = createStyleSheet({
  center: {
    borderWidth: 1,
    borderColor: Colors.danger
  },
  codes: {
    alignSelf: 'stretch'
  },
  modal: {},
  modalBody: {
    flex: 1,
    marginLeft: '20%',
    marginRight: '20%',
    alignItems: 'center',
    justifyContent: 'center'
  }
})