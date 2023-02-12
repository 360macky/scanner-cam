import React from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'
import useWindowOrientation from 'use-window-orientation'

interface MobilePanelProps {
  children: React.ReactNode
}

const MobilePanel = ({ children }: MobilePanelProps) => {
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  const { landscape } = useWindowOrientation()
  return (
    <div
      className={classNames('w-full h-full flex-row justify-between', {
        hidden:
          modelStatus === 'LOADING' ||
          modelStatus === 'START' ||
          modelStatus === 'ERROR',
        flex: modelStatus === 'READY',
        'flex-col': landscape
      })}
    >
      {children}
    </div>
  )
}

export default MobilePanel
