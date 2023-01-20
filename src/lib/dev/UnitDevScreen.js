import React, { useContext, useState, useRef } from 'react'
import { loadDocs } from '../meteor/loadDocs'
import { AppSessionContext } from '../state/AppSessionContext'
import { loadDevUnit } from './loadDevUnit'
import { ScreenBase } from '../screens/BaseScreen'
import { UnitRenderer } from '../screens/unit/UnitRenderer'
import { ActionButton } from '../components/ActionButton'
import { checkResponse } from '../screens/unit/createResponseDoc'
import Colors from '../constants/Colors'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export const UnitDevScreen = props => {
  const { t } = useTranslation()
  const responseRef = useRef({})
  const scoreRef = useRef({})
  const [page, setPage] = useState(0)
  const [show, setShow] = useState(true)
  const [scored, setScored] = useState(-1)
  const [allTrue, setAllTrue] = useState(-1)
  const [session, sessionActions] = useContext(AppSessionContext)
  const { unitId, dimension } = session
  const unitDocs = loadDocs({
    fn: () => loadDevUnit(unitId)
  })

  const unitDoc = unitDocs?.data

  const submitResponse = async ({ responses, data }) => {
    responseRef.current[page] = { responses, data }
  }

  const checkScore = async () => {
    const currentResponse = responseRef.current[page]
    const checked = await checkResponse({ currentResponse })
    scoreRef.current[page] = checked.scoreResult
    setAllTrue(checked.allTrue)
    setScored(page)
  }

  const showCorrectResponse = scored === page
  const scoreResult = showCorrectResponse && scoreRef.current[page]
  const nextPage = () => {
    setAllTrue(false)
    setPage(page + 1)
  }
  const retry = () => {
    setShow(false)
    setAllTrue(false)
    setScored(-1)
    delete scoreRef.current[page]
    delete responseRef.current[page]
    setTimeout(() => setShow(true), 300)
  }

  const renderTaskPageActions = () => {
    const hasNextPage = page < unitDoc.pages.length - 1
    return (
      <View>
        {!showCorrectResponse && <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.check')}
          color={Colors.primary}
          icon='edit'
          onPress={checkScore}
        />}
        {showCorrectResponse && <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.retry')}
          color={Colors.primary}
          icon='edit'
          onPress={retry}
        />}
        {hasNextPage && <ActionButton
          block
          align="center"
          tts={t('unitScreen.actions.next')}
          icon='arrow-right'
          color={Colors.primary}
          onPress={nextPage}
        />}
        <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.finish')}
          color={Colors.primary}
          icon='times'
          onPress={() => props.navigation.goBack()}
        />
      </View>
    )
  }


  return (
    <ScreenBase {...unitDocs}>
      {show && <UnitRenderer
        unitDoc={unitDoc}
        page={page}
        showCorrectResponse={showCorrectResponse}
        submitResponse={submitResponse}
        allTrue={allTrue}
        taskPageAction={renderTaskPageActions}
        scoreResult={scoreResult}
        dimension={dimension} />}
    </ScreenBase>
  )
}
