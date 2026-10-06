import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from './rootReducer';
import { persistMiddleware, loadPersistedState } from './persistMiddleware';

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const initialPreloaded =
    preloadedState ?? (typeof window !== 'undefined' ? loadPersistedState() : undefined);

  return configureStore({
    reducer: rootReducer,
    preloadedState: initialPreloaded,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(persistMiddleware),
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = typeof store.dispatch;
export type { RootState } from './rootReducer';

export default store;
