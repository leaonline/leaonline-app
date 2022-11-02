import React, { useContext, useState } from 'react'
import { View, Modal } from 'react-native'
import { TTSengine, useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../components/ActionButton'
import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'
import { deleteAccount } from '../../meteor/deleteAccount'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { AuthContext } from '../../contexts/AuthContext'
import { Layout } from '../../constants/Layout'
import { expectNoConsoleError } from 'react-native/Libraries/Utilities/ReactNativeTestTools'

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
  const { Tts } = useTts()
  const { signOut } = useContext(AuthContext)

  const handleSignOut = () => signOut({ onError: err => console.error(err) })
  const renderCodes = () => {
    if (!codes) { return null }
    return codes.map((code, index) => {
      const text = code.split('').join(' ')
      return (<Tts key={code} block  fontStyle={styles.code} text={text} />)
    })
  }

  const requestRestoreCode = async () => {
    console.debug('request restore codes', codes)
    try {
      if (!codes?.length) {
        const restore = await callMeteor({ name: 'users.methods.getCodes', args: {} })
        console.debug(restore)
        setCodes(restore.split('-')) // TODO config via env
      }

      setModalVisible(true)
    }
    catch (e) {
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
    <React.Fragment>
      <View style={styles.container}>
        <ActionButton icon='lock' text={t('accountInfo.restoreCodes')} onPress={requestRestoreCode} block />
        <ActionButton icon='sign-out-alt' text={t('accountInfo.signOut')} block onPress={handleSignOut} />
        <ActionButton icon='trash' text={t('accountInfo.delete')} onPress={deleteMeteorAccount} block />
      </View>
      <Modal
        animationType='slide'
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
        style={styles.modal}>
        <View style={styles.modalBody}>
          <Tts text={t('accountInfo.whyRestore')} block style={styles.modalInstructions} />
          <View style={styles.codes}>
            {renderCodes()}
          </View>
          <ActionButton icon='times' containerStyle={styles.modalClose} block text={t('actions.close')} onPress={() => setModalVisible(!modalVisible)} />
        </View>
      </Modal>
    </React.Fragment>
  )
}

const styles = createStyleSheet({
  container: Layout.container({ margin: 0 }),
  center: {
    borderWidth: 1,
    borderColor: Colors.danger
  },
  modalInstructions: {
    flex: 1,
  },
  codes: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-around'
  },
  code: {
    fontWeight: 'bold',
    fontSize: 44,
    height: '100%',
    lineHeight: 88,
  },
  modal: {},
  modalClose: {
    flex: 1
  },
  modalBody: {
    ...Layout.container()
  }
})
