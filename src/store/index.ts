import { configureStore } from '@reduxjs/toolkit'
import moduleSwitcher from './moduleSwitcherSlice'

export const store = configureStore({
  reducer: {
    moduleSwitcher,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
