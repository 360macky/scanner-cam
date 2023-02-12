import React from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'

interface DesktopPanelProps {
  children: React.ReactNode
  webcamHoldRef: React.RefObject<HTMLDivElement>
}

const DesktopPanel = ({ children, webcamHoldRef }: DesktopPanelProps) => {
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  return (
    <div
      className={classNames(
        'transition-all absolute lg:flex justify-between hidden pb-[1.25rem] z-10',
        {
          'lg:hidden': modelStatus !== 'READY'
        }
      )}
      style={{
        width:
          webcamHoldRef.current != null
            ? `calc(${webcamHoldRef.current.clientWidth}px - 2.8rem)`
            : '30rem'
      }}
    >
      {children}
    </div>
  )
}

export default DesktopPanel
