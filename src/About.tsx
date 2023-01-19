import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import Smartphone from './assets/smartphone.webp'

interface AboutProps {
  insideApp: boolean
}

function About ({ insideApp }: AboutProps) {
  const { t } = useTranslation()
  return (
    <section
      className={classNames(
        'min-h-screen bg-redcandylight dark:bg-reddarker p-4 py-16 lg:flex justify-center',
        { hidden: insideApp }
      )}
      id="about"
    >
      <div className="max-w-[1020px] bg-[white] dark:text-[white] dark:bg-reddark text-xl rounded-2xl p-8 flex flex-col gap-y-4 lg:flex-row">
        <div className="lg:w-[1000px] p-4 lg:flex justify-center items-center">
          <img src={Smartphone} alt="Preview of ScannerCam on smartphone" />
        </div>
        <article className="p-8">
          <h2 className="text-3xl text-left font-extrabold mb-3">{t('about')} ScannerCam</h2>
          <p><b>Scanner Cam</b> {t('about.description')}</p>
        </article>
      </div>
    </section>
  )
}

export default About
