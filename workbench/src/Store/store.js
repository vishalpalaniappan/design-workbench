import {configureStore} from "@reduxjs/toolkit";

import engine from "../Providers/DalEngine";
import appReducer from "./appSlice";
import scriptingReducer from "./scriptingSlice/scriptingSlice";

export const store = configureStore({
    reducer: {
        app: appReducer,
        scripting: scriptingReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: {engine},
            },
        }),
});
