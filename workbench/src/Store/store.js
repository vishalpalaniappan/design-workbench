import {configureStore} from "@reduxjs/toolkit";

import engine from "../Providers/DalEngine";
import appReducer from "./appSlice";
import debuggingReducer from "./debuggingSlice/debuggingSlice";
import scriptingReducer from "./scriptingSlice/scriptingSlice";

export const store = configureStore({
    reducer: {
        app: appReducer,
        debugging: debuggingReducer,
        scripting: scriptingReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: {engine},
            },
        }),
});
