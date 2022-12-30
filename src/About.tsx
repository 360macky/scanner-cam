import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

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
      <div className="max-w-[1020px] bg-[white] dark:text-[white] dark:bg-reddark text-xl rounded-2xl p-8">
        <b>Scanner Cam</b> {t('about.description')}
      </div>
    </section>
  )
}

export default About
