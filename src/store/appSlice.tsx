import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import InitialState, {
  BROWSER_MODEL_STATUS,
  CAMERA_MODE
} from '../types/initialState'

const initialState: InitialState = {
  webcamLoaded: false,
  speechLoaded: false,
  detections: [],
  modelStatus: 'START',
  isWebcamOn: false,
  cameraMode: CAMERA_MODE.USER,
  detailedDetections: [],
  userConfiguration: {
    detectionFrequency: 200
  }
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setWebcamLoaded: (state, action: PayloadAction<boolean>) => {
      state.webcamLoaded = action.payload
    },
    setSpeech: (state, action: PayloadAction<boolean>) => {
      state.speechLoaded = action.payload
    },
    setDetections: (state, action: PayloadAction<any>) => {
      state.detections = action.payload
    },
    setModelStatus: (state, action: PayloadAction<BROWSER_MODEL_STATUS>) => {
      state.modelStatus = action.payload
    },
    toggleWebcam: (state) => {
      state.isWebcamOn = !state.isWebcamOn
    },
    toggleCameraMode: (state) => {
      state.cameraMode =
        state.cameraMode === CAMERA_MODE.USER
          ? CAMERA_MODE.ENVIRONMENT
          : CAMERA_MODE.USER
    },
    setDetailedDetections: (state, action: PayloadAction<any[]>) => {
      state.detailedDetections = action.payload
    },
    pushDetailedDetections: (state, action: PayloadAction<any>) => {
      // Push a list of detections to the detailedDetections list
      let newDetections = action.payload
      // If any string of newDetections is in the detailedDetections list, skip it, otherwise add it
      newDetections = newDetections.filter((newDetection: any) => {
        return !state.detailedDetections.find(
          (detection) => detection === newDetection
        )
      })
      state.detailedDetections = [...state.detailedDetections, ...newDetections]
    },
    setUserConfiguration: (state, action: PayloadAction<any>) => {
      state.userConfiguration = action.payload
    }
  }
})

export const {
  setSpeech,
  setWebcamLoaded,
  setDetections,
  setModelStatus,
  toggleWebcam,
  toggleCameraMode,
  setDetailedDetections,
  pushDetailedDetections,
  setUserConfiguration
} = appSlice.actions
export default appSlice.reducer
