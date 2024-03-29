import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  Suspense
} from 'react'
import { NextPage, GetStaticProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import Image from 'next/image'
import dynamic from 'next/dynamic'

import Webcam from 'react-webcam'
import classNames from 'classnames'
import useWindowOrientation from 'use-window-orientation'
import { useTranslation } from 'next-i18next'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as cocossd from '@tensorflow-models/coco-ssd'
import { RootState } from '../store/appStore'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSpeech,
  setWebcamLoaded,
  setDetections,
  setModelStatus,
  toggleWebcam,
  toggleCameraMode,
  pushDetailedDetections
} from '../store/appSlice'
import { getDetectionFrequency } from '../config/firebase'

import ProgressBar from '../components/ProgressBar'
import ProgressMessage from '../components/ProgressMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import StartButton from '../components/StartButton'
import CameraSwitchButton from '../components/CameraSwitchButton'
import MobilePanel from '../components/MobilePanel'
import DesktopPanel from '../components/DesktopPanel'
import Tensorgram from '../components/Tensorgram'

import WebcamBaseModule from '../components/WebcamBaseModule'
import WebcamCoreModule from '../components/WebcamCoreModule'

import VolumeOff from '../assets/icons/volume_off.svg'
import VolumeOn from '../assets/icons/volume_on.svg'
import VideocamOff from '../assets/icons/videocam_off.svg'
import Videocam from '../assets/icons/videocam.svg'
import WelcomeLogo from '../assets/welcome-icon.svg'

import isiOS from '../utils/isiOS'
import wait from '../utils/wait'

import ScannerDetection from '../types/ScannerDetection'
import { BROWSER_MODEL_STATUS, CAMERA_MODE } from '../types/initialState'
import { DEFAULT_DETECTION_FREQUENCY } from '../ui'
import { AuthContext } from '../auth/AuthProvider'

const AppDesktopContainer = dynamic(
  async () => await import('../components/AppDesktopContainer'),
  { ssr: false }
)

let _voices: any
const _cache: any = {}

/**
 * @name loadWebVoicesWhenAvailable
 * @description Load voices when available in browser.
 * Source: https://stackoverflow.com/a/61963317/10576458
 */
function loadWebVoicesWhenAvailable() {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length !== 0) {
    _voices = voices
  }
}

/**
 * @name getVoices
 * @description Get voices by locale.
 * @param {string} locale
 */
function getVoices(locale: any) {
  // Check if browsers support speech synthesis.
  if (!window.speechSynthesis) {
    window.alert('Browser does not support speech synthesis')
    throw new Error('Browser does not support speech synthesis')
  }
  try {
    if (_cache[locale]) return _cache[locale]
    _cache[locale] = _voices.filter((voice: any) => voice.lang === locale)
    return _cache[locale]
  } catch (error) {
    window.alert('Browser does not support speech synthesis')
    throw new Error('Browser does not support speech synthesis')
  }
}

/**
 * @name playByText
 * @description Play text by locale.
 * @param {string} locale
 * @param {string} text
 * @param {any} onEnd
 */
function playByText(locale: string, text: string, onEnd?: any) {
  const voices = getVoices(locale)

  const utterance = new window.SpeechSynthesisUtterance()
  utterance.voice = voices[0]
  utterance.pitch = 1
  utterance.rate = 1
  utterance.volume = 1
  utterance.rate = 1
  utterance.pitch = 0.8
  utterance.text = text
  utterance.lang = locale

  if (onEnd) {
    utterance.onend = onEnd
  }

  // Cancel current speaking if there is one running.
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

let detectionsStorage: string[] = []
let voiceActivated = false

/**
 * @name Home - Home page.
 * @component
 */
const Home: NextPage = () => {
  const { t } = useTranslation('common')
  const user = useContext(AuthContext)
  const dispatch = useDispatch()
  const speechLoaded: boolean = useSelector(
    (state: RootState) => state.app.speechLoaded
  )
  const webcamLoaded: boolean = useSelector(
    (state: RootState) => state.app.webcamLoaded
  )
  const detections: ScannerDetection[] = useSelector(
    (state: RootState) => state.app.detections
  )
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  const isWebcamOn: boolean = useSelector(
    (state: RootState) => state.app.isWebcamOn
  )
  const cameraMode: CAMERA_MODE = useSelector(
    (state: RootState) => state.app.cameraMode
  )

  const webcamRef = useRef<Webcam>(null)
  const tensorGramRef = useRef<HTMLDivElement>(null)
  const webcamHoldRef = useRef<HTMLDivElement>(null)
  const { portrait, landscape } = useWindowOrientation()
  const [neuralNetwork, setNeuralNetwork] = useState<any>(null)
  const [voiceUI, setVoiceUI] = useState<boolean>(false)
  const [detectionFrequency, setDetectionFrequency] = useState<number>(
    DEFAULT_DETECTION_FREQUENCY
  )

  const videoConstraints = {
    facingMode: CAMERA_MODE.USER
  }

  /**
   * @name createTensorgram
   * @description Create tensorgram from detections array.
   * @param {ScannerDetection[]} detections
   */
  const createTensorgram = (detections: ScannerDetection[]) => {
    const tensorgram = document.getElementById('tensorgram') as HTMLDivElement
    tensorgram.replaceChildren()
    detections.forEach((detection: ScannerDetection) => {
      const [x, y, width, height] = detection.bbox
      const text = detection.class

      const frameDetect = document.createElement('div')
      const frameLabelContainer = document.createElement('div')
      const frameLabelText = document.createElement('p')
      frameLabelText.innerText = text
      frameLabelContainer.appendChild(frameLabelText)
      frameDetect.appendChild(frameLabelContainer)
      frameDetect.classList.add('tensorframe')
      frameDetect.style.position = 'absolute'

      const videoSelected = document.getElementById(
        'webcam'
      ) as HTMLVideoElement
      const tensorGram = document.getElementById('tensorgram') as HTMLDivElement

      const clientWidth = tensorGram.clientWidth
      const videoWidth = videoSelected.videoWidth
      const clientHeight = tensorGram.clientHeight
      const videoHeight = videoSelected.videoHeight

      frameDetect.style.width = `${(width * clientWidth) / videoWidth}px`
      frameDetect.style.height = `${(height * clientHeight) / videoHeight}px`
      frameDetect.style.left = `${(x * clientWidth) / videoWidth}px`
      frameDetect.style.top = `${(y * clientHeight) / videoHeight}px`

      tensorgram.appendChild(frameDetect)
    })
  }

  useEffect(() => {
    loadWebVoicesWhenAvailable()
    return () => {}
  }, [])

  /**
   * @name loadNeuralNetwork
   * @description Load neural network model.
   * @returns {Promise<void>}
   */
  const loadNeuralNetwork = async () => {
    dispatch(setModelStatus('LOADING'))
    if (!navigator.onLine) {
      alert(t('error.offline'))
      return
    }
    try {
      dispatch(setModelStatus('LOADING'))
      const network = await cocossd.load()
      setNeuralNetwork(network)
      dispatch(setModelStatus('READY'))
    } catch (error) {
      dispatch(setModelStatus('ERROR'))
      console.error(error)
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  /**
   * @name handleRevertCameraMode
   * @description Revert camera mode.
   */
  const handleRevertCameraMode = useCallback(() => {
    dispatch(toggleCameraMode())
  }, [])

  useEffect(() => {
    const f = async () => {
      while (voiceActivated) {
        await wait(
          detectionsStorage.length === 1
            ? 5000
            : detectionsStorage.length * 3000
        )

        if (detectionsStorage.length > 0) {
          if (typeof parseObjects(detectionsStorage) !== 'undefined') {
            const detectionMessage = `${t('identifyprefix')} ${parseObjects(
              detectionsStorage
            )}.`
            if (voiceActivated) {
              playByText(navigator.language, detectionMessage)
            }
          }
        }
      }
    }
    f()

    return () => {}
  }, [voiceUI])

  /**
   * @name detect
   * @description Detect objects in the video stream.
   * @param {any} net
   */
  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null
    ) {
      if (webcamRef.current.video) {
        if (webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video
          if (!webcamLoaded) {
            dispatch(setWebcamLoaded(true))
          } else {
            const cocoDetections = await net.detect(video)
            const parsedDetections = cocoDetections.map(
              (detection: any) => detection.class
            )
            const translatedDetections = cocoDetections.map(
              (detection: any) => {
                return {
                  bbox: detection.bbox,
                  class: t(detection.class)
                }
              }
            )
            const classDetections = cocoDetections.map(
              (detection: any) => detection.class
            )
            dispatch(pushDetailedDetections(classDetections))
            if (detections.join() === parsedDetections.join()) {
              detectionsStorage = []
            } else {
              detectionsStorage = parsedDetections
            }
            createTensorgram(translatedDetections)
          }
        }
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (neuralNetwork) {
        detect(neuralNetwork)
      }
    }, detectionFrequency)
    return () => clearInterval(interval)
  }, [neuralNetwork, webcamLoaded, detections])

  useEffect(() => {
    const f = async () => {
      if (user) {
        setDetectionFrequency(await getDetectionFrequency(user.uid))
      }
    }
    f()
    return () => {}
  }, [user])

  useEffect(() => {
    if (webcamRef.current && webcamLoaded) {
      const videoElement = webcamRef.current.video as HTMLVideoElement
      const { clientHeight, clientWidth } = videoElement
      const tensorGramVideo = tensorGramRef.current as HTMLDivElement

      tensorGramVideo.style.width = `${clientWidth}px`
      tensorGramVideo.style.height = `${clientHeight}px`
    }
    return () => {}
  }, [webcamLoaded, webcamRef, portrait, landscape])

  /**
   * @name parseObjects
   * @description Parse objects to string.
   * @param {string[]} objects
   * @returns {string}
   */
  const parseObjects = (objects: string[]): string => {
    const translatedObjects = objects.map((object) => t(`${object}.noun`))
    if (translatedObjects.length === 1) {
      return translatedObjects.toString()
    } else {
      const resObjects =
        translatedObjects.slice(0, -1).join(', ') +
        `, ${t('objectconnector')} ` +
        translatedObjects.slice(-1)[0]
      return resObjects
    }
  }

  /**
   * @name handleVoiceActivation
   * @description Handle voice activation. If the device is iOS, it will show an error alert.
   * @returns {void}
   */
  const handleVoiceActivation = async () => {
    if (isiOS()) {
      window.alert(t('error.ios.voice'))
      return
    }
    if (!isWebcamOn) {
      window.alert(t('error.inactive.camera'))
      return
    }
    if (!speechLoaded) {
      loadWebVoicesWhenAvailable()
      dispatch(setSpeech(true))
    }
    setVoiceUI(!voiceActivated)
    voiceActivated = !voiceActivated
  }

  /**
   * @name handleCameraActivation
   * @description Handle camera activation.
   * @returns {void}
   */
  const handleCameraActivation = (): void => {
    // When the camera is about to turn off, also turn off the element-to-voice.
    if (isWebcamOn) {
      voiceActivated = false
      setVoiceUI(false)
    }
    dispatch(toggleWebcam())
    dispatch(setDetections([]))
    const tensorGram = document.getElementById('tensorgram') as HTMLDivElement
    tensorGram.replaceChildren()
  }

  const ObjectToVoiceButton = () => {
    return (
      <button
        title={voiceActivated ? t('turn.on.voice') : t('turn.off.voice')}
        className="bg-redlighter dark:bg-redlight transition hover:scale-110 rounded-full p-[0.8rem] active:ring ring-redlight/60"
        onClick={handleVoiceActivation}
      >
        {voiceActivated ? (
          <Image
            src={VolumeOn}
            alt={t('turn.off.voice')}
            className="h-[2.5rem] lg:w-[1.7rem] lg:h-[1.7rem] select-none"
          />
        ) : (
          <Image
            src={VolumeOff}
            alt={t('turn.on.voice')}
            className="h-[2.5rem] lg:w-[1.7rem] lg:h-[1.7rem] select-none"
          />
        )}
      </button>
    )
  }

  return (
    <>
      <Head>
        <title>ScannerCam</title>
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="h-full lg:min-h-screen bg-[white] dark:bg-redblack lg:bg-[white] lg:dark:bg-redblack">
          <AppDesktopContainer>
            <WebcamBaseModule webcamHoldRef={webcamHoldRef}>
              <Image
                src={WelcomeLogo}
                alt={t('welcome.message')}
                className="welcome hidden lg:block dark:invert-0 invert select-none"
                aria-hidden="true"
              />
              <h2
                className={classNames(
                  'dark:text-redlight text-redcandydark text-3xl lg:text-5xl font-extrabold transition delay-300',
                  {
                    'opacity-0': isWebcamOn,
                    'opacity-100': !isWebcamOn
                  }
                )}
              >
                {t('welcome.message')}
              </h2>
              <p
                className={classNames(
                  ' dark:text-[white] text-lg transition delay-300',
                  {
                    'opacity-0': isWebcamOn,
                    'opacity-100': !isWebcamOn
                  }
                )}
              >
                {t('welcome.description')}
              </p>
              <StartButton
                onClick={async () => await loadNeuralNetwork()}
                title={
                  modelStatus === 'LOADING' ? t('starting.app') : t('start.app')
                }
              />
            </WebcamBaseModule>
            {isWebcamOn && (
              <WebcamCoreModule
                webcamRef={webcamRef}
                videoConstraints={videoConstraints}
                cameraMode={cameraMode}
              />
            )}
            <Tensorgram tensorGramRef={tensorGramRef} />
            <DesktopPanel webcamHoldRef={webcamHoldRef}>
              <ObjectToVoiceButton />
              <button
                onClick={handleCameraActivation}
                title={isWebcamOn ? t('turn.off.camera') : t('turn.on.camera')}
                className="bg-redlighter dark:bg-redlight active:ring ring-redlight/60 transition hover:scale-110 rounded-full p-[0.8rem]"
              >
                {isWebcamOn ? (
                  <Image
                    src={Videocam}
                    alt={t('turn.on.camera')}
                    className="h-[2.5rem] lg:w-[1.7rem] lg:h-[1.7rem] select-none"
                  />
                ) : (
                  <Image
                    src={VideocamOff}
                    alt={t('turn.off.camera')}
                    className="h-[2.5rem] lg:w-[1.7rem] lg:h-[1.7rem] select-none"
                  />
                )}
              </button>
            </DesktopPanel>
          </AppDesktopContainer>
          <div
            className="hidden lg:flex lg:items-center lg:flex-col ml-auto mr-auto pt-4"
            style={{
              width:
                webcamHoldRef.current != null
                  ? `calc(${webcamHoldRef.current.clientWidth}px - 2.8rem)`
                  : '30rem'
            }}
          >
            <ProgressBar />
            <ProgressMessage />
          </div>
          <div
            className={classNames(
              'w-full px-[1.2rem] py-[1rem] fixed left-0 bottom-0 flex text-white text-2xl bg-redcandydark lg:hidden lg:flex-row z-30',
              {
                'w-auto flex-col right-0 left-auto h-full rounded-[2.8rem]':
                  landscape,
                'rounded-t-[2.8rem] h-auto': !landscape,
                'justify-between': modelStatus === 'READY',
                'justify-center':
                  modelStatus === 'START' || modelStatus === 'LOADING'
              }
            )}
          >
            <LoadingSpinner />
            <MobilePanel>
              <button
                title={
                  voiceActivated ? t('turn.off.voice') : t('turn.on.voice')
                }
                className="bg-redlight rounded-full p-[0.8rem] transition active:bg-redlighter"
                onClick={handleVoiceActivation}
              >
                {voiceActivated ? (
                  <Image
                    src={VolumeOn}
                    alt={t('turn.on.voice')}
                    className="h-[2.5rem] w-[2.5rem]"
                  />
                ) : (
                  <Image
                    src={VolumeOff}
                    alt={t('turn.off.voice')}
                    className="h-[2.5rem] w-[2.5rem]"
                  />
                )}
              </button>
              <CameraSwitchButton onClick={handleRevertCameraMode} />
              <button
                title={isWebcamOn ? t('turn.off.camera') : t('turn.on.camera')}
                className={classNames(
                  'bg-redlight rounded-full p-[0.8rem] transition active:bg-redlighter',
                  {}
                )}
                onClick={handleCameraActivation}
              >
                {isWebcamOn ? (
                  <Image
                    src={Videocam}
                    alt={t('revert.camera')}
                    className="h-[2.5rem] w-[2.5rem]"
                  />
                ) : (
                  <Image
                    src={VideocamOff}
                    alt={t('revert.camera')}
                    className="h-[2.5rem] w-[2.5rem]"
                  />
                )}
              </button>
            </MobilePanel>
          </div>
        </div>
      </Suspense>
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

export default Home
