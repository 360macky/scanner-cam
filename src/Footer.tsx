import React from 'react'
import { useTranslation } from 'react-i18next'

function Footer () {
  const { t } = useTranslation()
  return (
    <footer className="bg-[black] lg:flex flex-col justify-center py-6 text-lg hidden">
      <div className="text-center text-redlighter">
        <p>ScannerCam is powered by TensorFlow.js - Machine Learning in your browser</p>
      </div>
      <div className="flex flex-row gap-x-4 justify-center py-2">
        <a href="https://github.com/360macky/scanner-cam" className="text-[white] hover:underline">{t('footer.source.code')}</a>
        <a href="https://github.com/360macky/scanner-cam#-contributing" className="text-[white] hover:underline">{t('footer.contribution')}</a>
        <a href="https://github.com/360macky/scanner-cam/issues" className="text-[white] hover:underline">{t('footer.issues')}</a>
        <a href="https://github.com/360macky" className="text-[white] hover:underline">@360macky</a>
      </div>
    </footer>
  )
}

export default Footer
