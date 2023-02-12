export type BROWSER_MODEL_STATUS = 'START' | 'LOADING' | 'READY' | 'ERROR'
export enum CAMERA_MODE {
  USER = 'user',
  ENVIRONMENT = 'environment'
}

interface InitialState {
  webcamLoaded: boolean
  speechLoaded: boolean
  detections: any[]
  modelStatus: BROWSER_MODEL_STATUS
  isWebcamOn: boolean
  cameraMode: CAMERA_MODE
}

export default InitialState
