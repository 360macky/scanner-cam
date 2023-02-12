import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'

const ProgressMessage = () => {
  const { t } = useTranslation()
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  return (
    <div
      className={classNames('transition-all duration-500 delay-[2000ms]', {
        'opacity-0': modelStatus === 'READY'
      })}
    >
      <p
        className="dark:text-[white] text-reddarker text-lg font-medium"
        role="status"
      >
        {modelStatus === 'LOADING' && t('loading.model.message')}
        {modelStatus === 'READY' && t('complete.model.message')}
      </p>
    </div>
  )
}

export default ProgressMessage
