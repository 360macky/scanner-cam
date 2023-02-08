import React, { useRef, useState, useEffect, useCallback } from 'react'
import Webcam from 'react-webcam'
import classNames from 'classnames'
import useWindowOrientation from 'use-window-orientation'
import { useTranslation } from 'react-i18next'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import { isMobile } from 'react-device-detect'

import './App.css'
import About from './About'

import Logo from './assets/logo.png'
import VolumeOff from './assets/icons/volume_off.svg'
import VolumeOn from './assets/icons/volume_on.svg'
import VideocamOff from './assets/icons/videocam_off.svg'
import Videocam from './assets/icons/videocam.svg'
import CameraSwitch from './assets/icons/cameraswitch.svg'
import WelcomeLogo from './assets/welcome-icon.svg'

import * as cocossd from '@tensorflow-models/coco-ssd'
import isiOS from './utils/isiOS'
import wait from './utils/wait'

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

type BROWSER_MODEL_STATUS = 'START' | 'LOADING' | 'READY' | 'ERROR'

function App() {
  const { t } = useTranslation()

  const webcamRef = useRef<Webcam>(null)

  const tensorGramRef = useRef<HTMLDivElement>(null)
  const webcamHoldRef = useRef<HTMLDivElement>(null)
  const { portrait, landscape } = useWindowOrientation()
  const [neuralNetwork, setNeuralNetwork] = useState<any>(null)
  const [modelStatus, setModelStatus] = useState<BROWSER_MODEL_STATUS>('START')
  const [webcamLoaded, setWebcamLoaded] = useState<boolean>(false)
  const [speechLoaded, setSpeechLoaded] = useState(false)

  const [detections, setDetections] = useState<any[]>([])
  const [webcamOn, setWebcamOn] = useState<boolean>(false)
  const [voiceUI, setVoiceUI] = useState<boolean>(false)

  const videoConstraints = {
    facingMode: CAMERA_MODE.USER
  }
  const [facingMode, setFacingMode] = useState(CAMERA_MODE.USER)

  interface ScannerDetection {
    bbox: any
    class: string
    score: any
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
  const loadNeuralNetwork = useCallback(async () => {
    if (!navigator.onLine) {
      alert('Navegador sin internet')
      return
    }
    try {
      setModelStatus('LOADING')
      const network = await cocossd.load()
      setNeuralNetwork(network)
      setModelStatus('READY')
    } catch (error) {
      setModelStatus('ERROR')
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }, [])

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
            const detectionMessage =
              'Estoy identificando una persona, una laptop y una taza.'
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
            setWebcamLoaded(true)
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
    if (!webcamOn) {
      window.alert(t('error.inactive.camera'))
      return
    }
    if (!speechLoaded) {
      loadWebVoicesWhenAvailable()
      setSpeechLoaded(true)
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
    // When the camera is about to turn off, also turn off the object-to-voice.
    if (webcamOn) {
      voiceActivated = false
      setVoiceUI(false)
    }
    setWebcamOn(!webcamOn)
    setDetections([])
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
      <div className="app h-full lg:min-h-screen bg-redblack lg:bg-[white] lg:dark:bg-reddark">
        <header
          className={classNames(
            'z-30 bg-redblack lg:bg-redcandydark lg:dark:bg-reddarker hidden lg:flex lg:justify-center h-[2.6rem] lg:h-auto lg:py-[0.4rem] sticky top-0',
            { hidden: landscape && isMobile }
          )}
        >
          <div className="flex justify-between items-center w-[1024px]">
            <div>
              <img
                src={Logo}
                alt="Scanner Cam"
                title="Scanner Cam"
                className="transition-all hover:rotate-180 hidden lg:block lg:h-[2.5rem]"
              />
            </div>
            <nav className="navbar">
              <ul>
                <li>
                  <a
                    className="text-[white] px-2 py-2 border-redlighter border-[1px] rounded-lg hover:bg-reddark active:ring ring-redlighter/60"
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
              'Webcam-module flex flex-col justify-center lg:pt-5 w-[640px] bg-redblack rounded-[2rem] gap-y-3',
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
              className="welcome hidden lg:block"
            />
            <h2
              className={classNames(
                'text-redlighter text-2xl lg:text-3xl font-bold transition delay-300',
                {
                  'opacity-0': webcamOn,
                  'opacity-100': !webcamOn
                }
              )}
            >
              {t('welcome.message')}
            </h2>
            <p
              className={classNames(
                'text-[white] text-lg transition delay-300',
                {
                  'opacity-0': webcamOn,
                  'opacity-100': !webcamOn
                }
              )}
            >
              {t('welcome.description')}
            </p>
            <button
              className={classNames(
                'bg-redlighter hover:brightness-110 active:ring ring-redlighter/60 w-auto self-center rounded-lg px-4 py-2 cursor-pointer transition text-[1.4rem] lg:text-[1.2rem] font-semibold',
                {
                  hidden: modelStatus === 'READY'
                }
              )}
              disabled={modelStatus === 'LOADING'}
              onClick={async () => await loadNeuralNetwork()}
            >
              {modelStatus === 'LOADING' ? t('starting.app') : t('start.app')}
            </button>
          </div>
          {webcamOn && (
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

          <div
            id="tensorgram"
            className={classNames('tensorgram', {
              'w-[calc(100vw-7rem)]': isMobile
            })}
            ref={tensorGramRef}
            style={{
              height: 'auto',
              width: 'auto'
            }}
          ></div>
          <div
            className={classNames(
              'transition-all absolute lg:flex justify-between hidden pb-[1.25rem] z-10',
              {
                'lg:hidden': modelStatus !== 'READY'
              }
            )}
            style={{
              width:
                webcamHoldRef.current != null
                  ? `calc(${webcamHoldRef.current.clientWidth}px - 2.8rem)`
                  : '30rem'
            }}
          >
            <ObjectToVoiceButton />
            <button
              onClick={handleCameraActivation}
              title={webcamOn ? t('turn.off.camera') : t('turn.on.camera')}
              className="bg-redlighter dark:bg-redlight transition hover:scale-110 rounded-full p-[0.8rem]"
            >
              {webcamOn ? (
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
          </div>
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
          <div
            className={classNames(
              'w-full bg-redblack rounded-full h-4 mb-4 transition-all duration-500 delay-1000',
              {
                'opacity-0': modelStatus === 'READY'
              }
            )}
            role="progressbar"
            aria-label={
              modelStatus === 'LOADING'
                ? t('loading.model.message')
                : t('complete.model.message')
            }
            aria-valuenow={modelStatus === 'LOADING' ? 0 : 100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={classNames(
                'bg-redcandylight h-4 rounded-full transition-all duration-500',
                {
                  'w-[0%]': modelStatus === 'LOADING',
                  'w-full': modelStatus === 'READY',
                  'opacity-0': modelStatus === 'START'
                }
              )}
            ></div>
          </div>
          <div
            className={classNames(
              'transition-all duration-500 delay-[2000ms]',
              {
                'opacity-0': modelStatus === 'READY'
              }
            )}
          >
            <p
              className="dark:text-[white] text-reddarker text-lg font-medium"
              role="status"
            >
              {modelStatus === 'LOADING' && t('loading.model.message')}
              {modelStatus === 'READY' && t('complete.model.message')}
            </p>
          </div>
        </div>
        <footer
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
          <div
            className={classNames('w-full justify-center z-40', {
              flex: modelStatus === 'LOADING',
              hidden:
                modelStatus === 'READY' ||
                modelStatus === 'START' ||
                modelStatus === 'ERROR'
            })}
          >
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 animate-spin fill-redlight"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">{t('loading.model.message')}</span>
            </div>
          </div>
          <div
            className={classNames('w-full h-full flex-row justify-between', {
              hidden:
                modelStatus === 'LOADING' ||
                modelStatus === 'START' ||
                modelStatus === 'ERROR',
              flex: modelStatus === 'READY',
              'flex-col': landscape
            })}
          >
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
                  flex: !webcamOn
                  // FIXME: flex: webcamOn
                }
              )}
              disabled={!webcamOn}
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
              title={webcamOn ? t('turn.off.camera') : t('turn.on.camera')}
              className={classNames(
                'bg-redlight rounded-full p-[0.8rem] transition active:bg-redlighter',
                {}
              )}
              onClick={handleCameraActivation}
            >
              {webcamOn ? (
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
          </div>
        </footer>
      </div>
      <About insideApp />
    </>
  )
}

export default App
