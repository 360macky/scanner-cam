import React from 'react'
import type { AppProps } from 'next/app'
import { appWithTranslation, useTranslation } from 'next-i18next'
import AuthProvider from '../auth/AuthProvider'
import { Provider } from 'react-redux'
import store from '../store/appStore'
import Footer from '../components/Footer'
import Header from '../components/Header'
import '../styles/globals.css'
import '../styles/App.css'

function MyApp({ Component, pageProps }: AppProps) {
  const { t } = useTranslation('common')
  return (
    <AuthProvider>
      <Provider store={store}>
        <Header t={t} />
        <Component {...pageProps} />
        <Footer t={t} />
      </Provider>
    </AuthProvider>
  )
}

export default appWithTranslation(MyApp)
