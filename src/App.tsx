import React, { useRef, useState, useEffect, useCallback } from 'react'
import Webcam from 'react-webcam'
import classNames from 'classnames'
import useWindowOrientation from 'use-window-orientation'
import { useTranslation } from 'react-i18next'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import { isMobile } from 'react-device-detect'
import * as cocossd from '@tensorflow-models/coco-ssd'
import { RootState } from './store/appStore'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSpeech,
  setWebcamLoaded,
  setDetections,
  setModelStatus,
  toggleWebcam
} from './store/appSlice'

import './App.css'
import About from './About'
import ProgressBar from './components/ProgressBar'
import ProgressMessage from './components/ProgressMessage'
import LoadingSpinner from './components/LoadingSpinner'
import StartButton from './components/StartButton'
import MobilePanel from './components/MobilePanel'
import DesktopPanel from './components/DesktopPanel'
import Tensorgram from './components/Tensorgram'

import VolumeOff from './assets/icons/volume_off.svg'
import VolumeOn from './assets/icons/volume_on.svg'
import VideocamOff from './assets/icons/videocam_off.svg'
import Videocam from './assets/icons/videocam.svg'
import CameraSwitch from './assets/icons/cameraswitch.svg'
import WelcomeLogo from './assets/welcome-icon.svg'

import isiOS from './utils/isiOS'
import wait from './utils/wait'

import ScannerDetection from './types/ScannerDetection'
import { BROWSER_MODEL_STATUS } from './types/initialState'

import { CAMERA_MODE } from './ui'

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

function App() {
  const { t } = useTranslation()
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

  const webcamRef = useRef<Webcam>(null)
  const tensorGramRef = useRef<HTMLDivElement>(null)
  const webcamHoldRef = useRef<HTMLDivElement>(null)
  const { portrait, landscape } = useWindowOrientation()
  const [neuralNetwork, setNeuralNetwork] = useState<any>(null)
  const [voiceUI, setVoiceUI] = useState<boolean>(false)

  const videoConstraints = {
    facingMode: CAMERA_MODE.USER
  }
  const [facingMode, setFacingMode] = useState(CAMERA_MODE.USER)

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

  useEffect(() => {
    const ifDarkThemeEnabled = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    if (ifDarkThemeEnabled) {
      const themeColorMetaTag = document.querySelector(
        'meta[name="theme-color"]'
      ) as HTMLMetaElement
      themeColorMetaTag.content = '#6A0012'
    }
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
    setFacingMode((prevState) =>
      prevState === CAMERA_MODE.USER
        ? CAMERA_MODE.ENVIRONMENT
        : CAMERA_MODE.USER
    )
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
    }, 200)
    return () => clearInterval(interval)
  }, [neuralNetwork, webcamLoaded, detections])

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
        className="bg-redlighter dark:bg-redlight transition hover:scale-110 rounded-full p-[0.8rem]"
        onClick={handleVoiceActivation}
      >
        {voiceActivated ? (
          <img
            src={VolumeOn}
            alt={t('turn.off.voice')}
            className="h-[2.5rem] lg:h-[1.7rem]"
          />
        ) : (
          <img
            src={VolumeOff}
            alt={t('turn.on.voice')}
            className="h-[2.5rem] lg:h-[1.7rem]"
          />
        )}
      </button>
    )
  }

  return (
    <>
      <div className="h-full lg:min-h-screen bg-redblack lg:bg-[white] lg:dark:bg-reddark">
        <div
          className={classNames(
            'rounded-lg bg-redblack lg:bg-opacity-0 flex items-end lg:justify-center lg:w-full lg:pt-[2.6rem]',
            {
              'h-full w-[calc(100vw-7rem)]': landscape && isMobile,
              'justify-center w-full min-h-full items-center h-[calc(100vh-16rem)]':
                !landscape && isMobile
            }
          )}
        >
          <div
            className={classNames(
              'Webcam-module flex flex-col justify-center lg:pt-5 w-[640px] bg-redblack dark:lg:bg-redblack lg:bg-white rounded-[2rem] gap-y-3',
              {
                'ml-0 h-screen': landscape && isMobile,
                'ml-auto lg:h-[480px]': !isMobile
              }
            )}
            ref={webcamHoldRef}
            id="webcam-holdref"
          >
            <img
              src={WelcomeLogo}
              alt={t('welcome.message')}
              className="welcome hidden lg:block dark:invert-0 invert"
              aria-hidden="true"
            />
            <h2
              className={classNames(
                'text-redlight text-2xl lg:text-4xl font-bold transition delay-300',
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
            <StartButton onClick={async () => await loadNeuralNetwork()} />
          </div>
          {isWebcamOn && (
            <Webcam
              id="webcam"
              ref={webcamRef}
              muted={true}
              className={classNames(
                'Webcam-module rounded-[2rem] lg:h-auto absolute',
                {
                  'h-auto': portrait && isMobile,
                  'h-screen': landscape && isMobile,
                  'ml-0': landscape && isMobile,
                  'ml-auto': !isMobile
                }
              )}
              videoConstraints={{
                ...videoConstraints,
                facingMode
              }}
            />
          )}
          <Tensorgram tensorGramRef={tensorGramRef} />
          <DesktopPanel webcamHoldRef={webcamHoldRef}>
            <ObjectToVoiceButton />
            <button
              onClick={handleCameraActivation}
              title={isWebcamOn ? t('turn.off.camera') : t('turn.on.camera')}
              className="bg-redlighter dark:bg-redlight transition hover:scale-110 rounded-full p-[0.8rem]"
            >
              {isWebcamOn ? (
                <img
                  src={Videocam}
                  alt={t('turn.off.camera')}
                  className="h-[2.5rem] lg:h-[1.7rem]"
                />
              ) : (
                <img
                  src={VideocamOff}
                  alt={t('turn.on.camera')}
                  className="h-[2.5rem] lg:h-[1.7rem]"
                />
              )}
            </button>
          </DesktopPanel>
        </div>
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
              title={voiceActivated ? t('turn.off.voice') : t('turn.on.voice')}
              className={classNames(
                'bg-redlight rounded-full p-[0.8rem] transition active:bg-redlighter',
                {}
              )}
              onClick={handleVoiceActivation}
            >
              {voiceActivated ? (
                <img
                  src={VolumeOn}
                  alt={t('turn.on.voice')}
                  className="h-[2.5rem]"
                />
              ) : (
                <img
                  src={VolumeOff}
                  alt={t('turn.off.voice')}
                  className="h-[2.5rem]"
                />
              )}
            </button>
            <button
              title={t('revert.camera')}
              className={classNames(
                'transition-all bg-redlight rounded-full p-[0.8rem] active:bg-redlighter',
                {
                  flex: !isWebcamOn
                  // FIXME: flex: webcamOn
                }
              )}
              disabled={!isWebcamOn}
              onClick={handleRevertCameraMode}
            >
              <img
                src={CameraSwitch}
                alt={t('revert.camera')}
                className="h-[2.5rem] transition-all duration-700"
                style={{
                  transform: `rotateY(${
                    facingMode === CAMERA_MODE.USER ? 180 : 0
                  }deg)`
                }}
              />
            </button>
            <button
              title={isWebcamOn ? t('turn.off.camera') : t('turn.on.camera')}
              className={classNames(
                'bg-redlight rounded-full p-[0.8rem] transition active:bg-redlighter',
                {}
              )}
              onClick={handleCameraActivation}
            >
              {isWebcamOn ? (
                <img
                  src={Videocam}
                  alt={t('revert.camera')}
                  className="h-[2.5rem]"
                />
              ) : (
                <img
                  src={VideocamOff}
                  alt={t('revert.camera')}
                  className="h-[2.5rem]"
                />
              )}
            </button>
          </MobilePanel>
        </div>
      </div>
      <About insideApp />
    </>
  )
}

export default App
