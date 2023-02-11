import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import useWindowOrientation from 'use-window-orientation'
import { isMobile } from 'react-device-detect'

const Header = () => {
  const { t } = useTranslation()
  const { landscape } = useWindowOrientation()
  return (
    <header
      className={classNames(
        'z-30 bg-redblack lg:bg-white lg:dark:bg-reddark hidden lg:flex lg:justify-center h-[2.6rem] lg:h-auto lg:py-4 sticky top-0',
        { hidden: landscape && isMobile }
      )}
    >
      <div className="flex justify-between items-center w-[1024px]">
        <div className="flex items-center gap-x-4">
          <span className="text-2xl font-bold text-reddark dark:text-redlighter">ScannerCam</span>
        </div>
        <nav className="navbar">
          <ul className="flex gap-x-2">
            <li>
              <a
                className="text-[white] px-2 py-2 border-reddark border-[1px] rounded-lg bg-reddark active:ring ring-reddark/60"
                href="https://twitter.com/intent/tweet?text=I%20love%20Scanner.cam!%20%23ScannerCam%20%40360macky"
                target={'_blank'}
                rel="noreferrer"
              >
                {t('nav.share.twitter')}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
