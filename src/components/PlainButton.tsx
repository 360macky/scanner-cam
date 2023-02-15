import React from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  title: string
}

const PlainButton = ({ onClick, title }: ButtonProps) => {
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  return (
    <button
      className={classNames(
        'bg-gradient-to-br from-redlightdimmed to-reddark text-white hover:brightness-110 active:ring ring-redlight/60 w-auto self-center rounded-lg px-4 py-2 cursor-pointer text-[1.4rem] lg:text-[1.2rem] font-semibold',
        {
          hidden: modelStatus === 'READY'
        }
      )}
      disabled={modelStatus === 'LOADING'}
      onClick={onClick}
      title={title}
    >
      {title}
    </button>
  )
}

export default PlainButton
