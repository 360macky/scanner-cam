import React from 'react'
import classNames from 'classnames'
import useWindowOrientation from 'use-window-orientation'
import { isMobile } from 'react-device-detect'

interface AppDesktopContainerProps {
  children: React.ReactNode
}

const AppDesktopContainer = ({ children }: AppDesktopContainerProps) => {
  const { landscape } = useWindowOrientation()
  return (
    <div
      className={classNames(
        'rounded-lg bg-white dark:bg-redblack lg:bg-opacity-0 flex items-end lg:justify-center lg:w-full lg:pt-[2.6rem]',
        {
          'h-full w-[calc(100vw-7rem)]': landscape && isMobile,
          'justify-center w-full min-h-full items-center h-[calc(100vh-16rem)]':
            !landscape && isMobile
        }
      )}
    >
      {children}
    </div>
  )
}

export default AppDesktopContainer
