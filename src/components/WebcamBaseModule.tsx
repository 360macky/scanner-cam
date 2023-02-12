import React from 'react'
import classNames from 'classnames'
import useWindowOrientation from 'use-window-orientation'
import { isMobile } from 'react-device-detect'

interface WebcamBaseModuleProps {
  webcamHoldRef: React.RefObject<HTMLDivElement>
  children: React.ReactNode
}

const WebcamBaseModule = ({
  webcamHoldRef,
  children
}: WebcamBaseModuleProps) => {
  const { landscape } = useWindowOrientation()
  return (
    <div
      className={classNames(
        'Webcam-module flex flex-col justify-center lg:pt-5 w-[640px] bg-redblack dark:lg:bg-redblack lg:bg-white rounded-[2rem] gap-y-3',
        {
          'ml-0 h-screen': landscape && isMobile,
          'ml-auto lg:h-[480px]': !isMobile
        }
      )}
      ref={webcamHoldRef}
      id="webcam-holdref"
    >
      {children}
    </div>
  )
}

export default WebcamBaseModule
