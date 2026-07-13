import {createSlice} from "@reduxjs/toolkit";

const debuggingSlice = createSlice({
    name: "debugging",
    initialState: {
        selectedTraceEntryIndex: null,
    },
    reducers: {
        setSelectedTraceEntryIndex: (state, action) => {
            state.selectedTraceEntryIndex = action.payload;
        },
    },
});

export const {
    setSelectedTraceEntryIndex,
} = debuggingSlice.actions;

export default debuggingSlice.reducer;
