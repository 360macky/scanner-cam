export type BROWSER_MODEL_STATUS = 'START' | 'LOADING' | 'READY' | 'ERROR'

interface InitialState {
  webcamLoaded: boolean
  speechLoaded: boolean
  detections: any[]
  modelStatus: BROWSER_MODEL_STATUS
  isWebcamOn: boolean
}

export default InitialState
