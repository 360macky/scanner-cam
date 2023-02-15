import React from 'react'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps, NextPage } from 'next/types'
import Page from '../components/Page'

const About: NextPage = () => {
  const { t } = useTranslation('common')
  return (
    <>
      <Head>
        <title>{t('about')} ScannerCam</title>
      </Head>
      <Page>
        <article className="p-8">
          <h2 className="text-3xl text-center font-extrabold mb-8">
            {t('about')} ScannerCam
          </h2>
          <p className="font-base">
            <b>Scanner Cam</b> {t('about.description')}
          </p>
        </article>
      </Page>
    </>
  )
}

export const getStaticProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string))
    }
  }
}

export default About
