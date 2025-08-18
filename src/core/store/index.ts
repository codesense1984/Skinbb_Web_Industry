import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "@/modules/auth/store/slices/authSlice";
import chatReducer from "@/core/store/slices/chatSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only persist auth
};

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);

// Types for usage in hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
