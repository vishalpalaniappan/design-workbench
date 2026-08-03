import {createSlice} from "@reduxjs/toolkit";

const appSlice = createSlice({
    name: "app",
    initialState: {
        activeTab: null,
        counter: 0,
        lastSaved: null,
        appMode: 1, // 1 = design,  2 = debugging
        designLoaded: false,
        hasEntryPoint: false,
        selectedInvariant: null,
        selectedTraceId: null,
        selectedTraceStmtId: null,
        statusMsg: null,
        tabs: null,
    },
    reducers: {
        setActiveTab(state, action) {
            // console.log("Setting active tab to:", action.payload);
            state.activeTab = action.payload;
        },
        setStatusMsg(state, action) {
            state.statusMsg = action.payload;
        },
        setLastSaved(state, action) {
            state.lastSaved = action.payload;
        },
        incrementCounter(state) {
            state.counter = (state.counter + 1) % 100000;
        },
        setDesignMode (state) {
            state.appMode = 1;
        },
        setDebuggingMode (state) {
            state.appMode = 2;
        },
        setDesignLoaded (state, action) {
            state.designLoaded = action.payload;
        },
        setHasEntryPoint (state, action) {
            state.hasEntryPoint = action.payload;
        },
        setSelectedTraceId (state, action) {
            state.selectedTraceId = action.payload;
        },
        setSelectedTraceStmtId (state, action) {
            state.selectedTraceStmtId = action.payload;
        }
    },
});

export const {
    setActiveTab,
    setStatusMsg,
    setLastSaved,
    setImplementationMode,
    setDebuggingMode,
    setDesignMode,
    incrementCounter,
    setDesignLoaded,
    setHasEntryPoint,
    setSelectedTraceId,
    setSelectedTraceStmtId,
} = appSlice.actions;

export default appSlice.reducer;
