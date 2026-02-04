import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ModuleKey = 'dashboard' | 'sales' | 'inventory'

interface ModuleState {
  current: ModuleKey
}

const initialState: ModuleState = {
  current: 'dashboard',
}

const slice = createSlice({
  name: 'moduleSwitcher',
  initialState,
  reducers: {
    setCurrent(state, action: PayloadAction<ModuleKey>) {
      state.current = action.payload
    },
  },
})

export const { setCurrent } = slice.actions
export default slice.reducer
