import React, { useEffect } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { GetStaticProps, NextPage } from 'next/types'
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  provider,
  createUserInFirestore
} from '../config/firebase'

import GoogleLogo from '../assets/logos/google.png'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const SignIn: NextPage = () => {
  const router = useRouter()
  const { t } = useTranslation('common')
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await createUserInFirestore(user)
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        console.error(errorMessage)
      }
    }
  }
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard')
      }
    })
  }, [])
  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>
      <main className="min-h-[80vh] flex justify-center items-center dark:bg-redblack">
        <div className="w-full h-full max-w-md md:h-auto">
          <div></div>
          <div>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white text-center">
                {t('signin.title')}
              </h3>
              <p className="dark:text-white text-center mb-4">
                {t('signin.description')}
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="bg-gradient-to-br from-redlightdimmed to-reddark text-white hover:brightness-110 active:ring ring-redlight/60 w-full flex justify-center items-center gap-x-4 rounded-lg px-4 py-2 cursor-pointer text-[1.4rem] lg:text-[1.2rem] font-semibold"
              >
                <Image alt={''} src={GoogleLogo} width={20} height={20} />
                {t('signin.with.google')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string))
    }
  }
}

export default SignIn
