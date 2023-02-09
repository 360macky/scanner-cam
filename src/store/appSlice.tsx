import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState = {
  speechLoaded: false
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSpeech: (state, action: PayloadAction<boolean>) => {
      state.speechLoaded = action.payload
    }
  }
})

export const { setSpeech } = appSlice.actions
export default appSlice.reducer
