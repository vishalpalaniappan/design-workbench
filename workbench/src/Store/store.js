import {configureStore} from "@reduxjs/toolkit";

import engine from "../Providers/DalEngine";
import workbench from "../Providers/WorkbenchApp";
import appReducer from "./appSlice";

export const store = configureStore({
    reducer: {
        app: appReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: {engine, workbench},
            },
        }),
});
