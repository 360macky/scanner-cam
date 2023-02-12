import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'

const ProgressBar = () => {
  const { t } = useTranslation()
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  return (
    <div
      className={classNames(
        'w-full dark:bg-black/20 bg-gray-200 rounded-full h-4 mb-4 transition-all duration-500 delay-1000',
        {
          'opacity-0': modelStatus === 'READY'
        }
      )}
      role="progressbar"
      aria-label={
        modelStatus === 'LOADING'
          ? t('loading.model.message')
          : t('complete.model.message')
      }
      aria-valuenow={modelStatus === 'LOADING' ? 0 : 100}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={classNames(
          'bg-redcandylight h-4 rounded-full transition-all duration-500',
          {
            'w-[0%]': modelStatus === 'LOADING',
            'w-full': modelStatus === 'READY',
            'opacity-0': modelStatus === 'START'
          }
        )}
      ></div>
    </div>
  )
}

export default ProgressBar
