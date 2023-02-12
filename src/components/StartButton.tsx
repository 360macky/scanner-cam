import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const StartButton = ({ onClick }: ButtonProps) => {
  const { t } = useTranslation()
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  return (
    <button
      className={classNames(
        'bg-redlighter hover:brightness-110 active:ring ring-redlighter/60 w-auto self-center rounded-lg px-4 py-2 cursor-pointer transition text-[1.4rem] lg:text-[1.2rem] font-semibold',
        {
          hidden: modelStatus === 'READY'
        }
      )}
      disabled={modelStatus === 'LOADING'}
      onClick={onClick}
    >
      {modelStatus === 'LOADING' ? t('starting.app') : t('start.app')}
    </button>
  )
}

export default StartButton