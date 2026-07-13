import {createSlice} from "@reduxjs/toolkit";

const appSlice = createSlice({
    name: "app",
    initialState: {
        activeTab: null,
        counter: 0,
        lastSaved: null,
        appMode: 1, // 1 = design,  2 = implementation, 3 = debugging
        designLoaded: false,
        hasEntryPoint: false,
        selectedBehavior: null,
        selectedParticipant: null,
        selectedGraph: null,
        selectedMapping: null,
        selectedInvariant: null,
        selectedTraceId: null,
        selectedTraceStmtId: null,
        statusMsg: null,
        tabs: null,
    },
    reducers: {
        setSelectedBehavior(state, action) {
            // console.log("Setting selected behavior to:", action.payload);
            state.selectedParticipant = null;
            state.selectedInvariant = null;
            if (action.payload) {
                state.selectedBehavior = action.payload;
            } else {
                state.selectedBehavior = null;
            }
        },
        setSelectedParticipant(state, action) {
            // console.log("Setting selected participant to:", action.payload);
            state.selectedInvariant = null;
            state.selectedParticipant = action.payload;
        },
        setSelectedGraph(state, action) {
            // console.log("Setting selected graph to:", action.payload);
            state.selectedBehavior = null;
            state.selectedParticipant = null;
            state.selectedInvariant = null;
            state.selectedGraph = action.payload;
        },
        setSelectedInvariant(state, action) {
            // console.log("Setting selected invariant to:", action.payload);
            state.selectedInvariant = action.payload;
        },
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
        setImplementationMode (state) {
            state.appMode = 2;
        },
        setDesignMode (state) {
            state.appMode = 1;
        },
        setDebuggingMode (state) {
            state.appMode = 3;
        },
        setSelectedMapping (state, action) {
            state.selectedMapping = action.payload;
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
    setSelectedBehavior,
    setSelectedParticipant,
    setActiveTab,
    setStatusMsg,
    setLastSaved,
    setImplementationMode,
    setDebuggingMode,
    setSelectedGraph,
    setSelectedInvariant,
    incrementCounter,
    setDesignMode,
    setSelectedMapping,
    setDesignLoaded,
    setHasEntryPoint,
    setSelectedTraceId,
    setSelectedTraceStmtId,
} = appSlice.actions;

export default appSlice.reducer;
