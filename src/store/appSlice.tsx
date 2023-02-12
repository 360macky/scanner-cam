import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import InitialState, { BROWSER_MODEL_STATUS } from '../types/initialState'

const initialState: InitialState = {
  webcamLoaded: false,
  speechLoaded: false,
  detections: [],
  modelStatus: 'START'
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
    }
  }
})

export const { setSpeech, setWebcamLoaded, setDetections, setModelStatus } =
  appSlice.actions
export default appSlice.reducer
