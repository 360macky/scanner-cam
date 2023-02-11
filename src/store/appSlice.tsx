import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  webcamLoaded: false,
  speechLoaded: false,
  detections: []
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
    }
  }
})

export const { setSpeech, setWebcamLoaded, setDetections } = appSlice.actions
export default appSlice.reducer
