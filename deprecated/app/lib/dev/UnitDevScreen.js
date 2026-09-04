import React, { useContext, useMemo, useReducer, useRef } from 'react'
import { useDocs } from '../meteor/useDocs'
import { AppSessionContext } from '../state/AppSessionContext'
import { loadDevUnit } from './loadDevUnit'
import { ScreenBase } from '../screens/BaseScreen'
import { UnitRenderer } from '../screens/unit/renderer/UnitRenderer'
import { ActionButton } from '../components/ActionButton'
import { checkResponse } from '../screens/unit/createResponseDoc'
import { Colors } from '../constants/Colors'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { getDimensionColor } from '../screens/unit/getDimensionColor'
import { Log } from '../infrastructure/Log'
import { unitPageHasItem } from '../screens/unit/unitPageHasItem'

const initialState = () => ({
  page: 0,
  scored: -1,
  show: true,
  allTrue: false
})

const reducer = (prevState, nextState) => {
  switch (nextState.type) {
    case 'to-page':
      return {
        ...prevState,
        page: nextState.page,
        allTrue: false
      }
    case 'scored':
      return {
        ...prevState,
        allTrue: nextState.allTrue,
        scored: nextState.scored
      }
    case 'reset':
      return {
        ...prevState,
        show: false,
        scored: nextState.scored,
        allTrue: false
      }
    case 'show':
      return {
        ...prevState,
        show: true
      }
  }
}

export const UnitDevScreen = props => {
  const { t } = useTranslation()
  const responseRef = useRef({})
  const scoreRef = useRef({})
  const [state, dispatch] = useReducer(reducer, initialState(), undefined)
  const { page, show, scored, allTrue } = state
  const [session] = useContext(AppSessionContext)
  const { unitId, dimension } = session
  const unitDocs = useDocs({
    fn: () => loadDevUnit(unitId)
  })

  const unitDoc = unitDocs?.data
  const hasItem = useMemo(() => {
    return unitPageHasItem({ unitDoc, page })
  }, [unitDoc, page])
  const dimensionColor = getDimensionColor(dimension)

  const submitResponse = async ({ responses, data }) => {
    responseRef.current[page] = responseRef.current[page] ?? {}
    responseRef.current[page][data.contentId] = { responses, data }
  }

  const checkScore = async () => {
    scoreRef.current[page] = scoreRef.current[page] ?? {}

    const allResponses = Object.values(responseRef.current[page])
    Log.print(allResponses.map(r => r.responses))
    const allTrue = []
    for (const currentResponse of allResponses) {
      const checked = await checkResponse({ currentResponse })

      scoreRef.current[page][currentResponse.data.contentId] = checked.scoreResult
      allTrue.push(checked.allTrue)
    }

    dispatch({
      type: 'scored',
      allTrue: allTrue.every(value => value === true),
      scored: page
    })
  }

  const showCorrectResponse = scored === page
  const scoreResult = showCorrectResponse && scoreRef.current[page]
  const nextPage = () => dispatch({ type: 'to-page', page: page + 1 })
  const retry = () => {
    dispatch({ type: 'reset' })

    setTimeout(() => {
      delete scoreRef.current[page]
      delete responseRef.current[page]
      dispatch({ type: 'show' })
    }, 500)
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
          icon='marker'
          disabled={!hasItem}
          onPress={checkScore}
                                 />}
        {showCorrectResponse && <ActionButton
          block
          align='center'
          tts={t('unitScreen.actions.retry')}
          color={Colors.primary}
          icon='marker'
          onPress={retry}
                                />}
        {hasNextPage && <ActionButton
          block
          align='center'
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
          icon='xmark'
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
        dimensionColor={dimensionColor}
        showCorrectResponse={showCorrectResponse}
        submitResponse={submitResponse}
        allTrue={allTrue}
        taskPageAction={renderTaskPageActions}
        scoreResult={scoreResult}
        dimension={dimension}
               />}
      {!show && <ActivityIndicator color={dimensionColor} size='large' />}
    </ScreenBase>
  )
}
