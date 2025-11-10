import { configureStore, createSlice } from '@reduxjs/toolkit';

// Simple app slice to provide a valid reducer
const appSlice = createSlice({
  name: 'app',
  initialState: {
    initialized: true,
  },
  reducers: {
    initialize: (state) => {
      state.initialized = true;
    },
  },
});

export const { initialize } = appSlice.actions;

// Create store with a valid reducer
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;