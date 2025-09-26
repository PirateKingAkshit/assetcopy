// @/redux-store/slices/user.js
import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: null
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload
    }
  }
})

export const { setEmail } = userSlice.actions

export default userSlice.reducer
