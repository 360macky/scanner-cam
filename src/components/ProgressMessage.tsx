import React from 'react'
import classNames from 'classnames'
import { BROWSER_MODEL_STATUS } from '../App'
import { useTranslation } from 'react-i18next'

interface ProgressMessageProps {
  modelStatus: BROWSER_MODEL_STATUS
}

const ProgressMessage = ({ modelStatus }: ProgressMessageProps) => {
  const { t } = useTranslation()
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
