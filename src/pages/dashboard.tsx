import React, { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticProps, NextPage } from 'next/types'
import Head from 'next/head'
import { AuthContext } from '../auth/AuthProvider'
import OnlyAuth from '../auth/OnlyAuth'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import {
  getDetectionFrequency,
  updateDetectionFrequency
} from '../config/firebase'
import PlainButton from '../components/PlainButton'

interface LatestDetectionProps {
  detectionClass: string
}

const LatestDetection = ({ detectionClass }: LatestDetectionProps) => {
  return (
    <div
      className="py-2 border rounded border-redlight text-center text-lg hover:bg-redlighter/30 cursor-pointer dark:hover:bg-redlight/10 dark:text-white capitalize"
      role="listitem"
    >
      {detectionClass}
    </div>
  )
}

/**
 * @name Dashboard
 * @description Dashboard page in Beta
 */
const Dashboard: NextPage = () => {
  const user = useContext(AuthContext)
  const [detectionFrequency, setDetectionFrequency] = useState<number>(200)

  const detailedDetections = useSelector(
    (state: RootState) => state.app.detailedDetections
  )

  useEffect(() => {
    const f = async () => {
      if (user) {
        setDetectionFrequency(await getDetectionFrequency(user.uid))
      }
    }
    f()
    return () => {}
  }, [])

  const saveChanges = () => {
    if (user) {
      updateDetectionFrequency(user.uid, detectionFrequency)
    }
    window.alert('Changes saved successfully')
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className="min-h-[80vh] dark:bg-redblack flex items-center flex-col gap-y-4">
        <OnlyAuth>
          <h1 className="dark:text-redlight text-4xl font-bold mt-4 select-none">
            Dashboard{' '}
            <span className="text-gray-500 font-semibold dark:text-gray-300">
              Beta
            </span>
          </h1>
          <p className="text-black dark:text-white text-lg">
            Hello {user?.displayName}
          </p>
          <div className="flex flex-col lg:items-start lg:flex-row flex-wrap gap-x-4 gap-y-4 w-full px-4 lg:w-[1020px]">
            <div className="border rounded-lg border-gray-200 hover:border-gray-400 p-6 flex-1 dark:border-gray-600">
              <h1 className="font-bold text-2xl dark:text-white">
                Latest detections
              </h1>
              <p className="dark:text-white text-sm font-medium">
                Here you can see the latest detections made by your camera.
              </p>
              <div className="flex gap-y-2 flex-col py-4" role="list">
                {detailedDetections.map((detection, index) => (
                  <LatestDetection detectionClass={detection} key={index} />
                ))}
                {detailedDetections.length === 0 && (
                  <p className="dark:text-redlight text-center font-medium">
                    No detections yet
                  </p>
                )}
              </div>
            </div>
            <div className="border rounded-lg border-gray-200 hover:border-gray-400 p-6 flex-1 dark:border-gray-600">
              <h1 className="font-bold text-2xl dark:text-white">
                Configuration
              </h1>
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Frecuency of detections in milliseconds
                </label>
                <input
                  type="number"
                  value={detectionFrequency}
                  className="bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-redlighter block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-redlighter outline-none active:ring focus:ring"
                  placeholder="200"
                  min={0}
                  max={2000}
                  required
                  onChange={(e) => {
                    setDetectionFrequency(parseInt(e.target.value))
                  }}
                />
                <div className="flex justify-center w-full mt-4">
                  <PlainButton onClick={saveChanges} title="Save changes" />
                </div>
              </div>
            </div>
          </div>
        </OnlyAuth>
      </main>
    </>
  )
}

// TODO: Update type of GetStaticProps in other pages
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale as string))
    }
  }
}

export default Dashboard
