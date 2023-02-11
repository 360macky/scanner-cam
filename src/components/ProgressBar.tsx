import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { BROWSER_MODEL_STATUS } from '../App'

interface ProgressBarProps {
  modelStatus: BROWSER_MODEL_STATUS
}

const ProgressBar = ({ modelStatus }: ProgressBarProps) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        'w-full dark:bg-redblack bg-gray-200 rounded-full h-4 mb-4 transition-all duration-500 delay-1000',
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
