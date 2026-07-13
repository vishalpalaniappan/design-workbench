import {createSlice} from "@reduxjs/toolkit";

const scriptingSlice = createSlice({
    name: "scripting",
    initialState: {
        transformOutput: null,
        transformOutputLog: [],
        scriptingCounter: 0,
    },
    reducers: {
        setTransformOutput (state, action) {
            state.transformOutput = action.payload;
        },
        setTransformOutputLog (state, action) {
            state.transformOutputLog = action.payload;
        },
        addTransformOutputLog (state, action) {
            state.transformOutputLog.push(action.payload);
        },
        incrementScriptingCounter (state) {
            state.scriptingCounter += 1;
        },
    },
});

export const {
    addTransformOutputLog,
    setTransformOutput,
    setTransformOutputLog,
    incrementScriptingCounter,
} = scriptingSlice.actions;

export default scriptingSlice.reducer;
