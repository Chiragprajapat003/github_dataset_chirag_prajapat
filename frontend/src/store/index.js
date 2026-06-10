import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import datasetReducer from './slices/datasetSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dataset: datasetReducer,
  },
});

export default store;
