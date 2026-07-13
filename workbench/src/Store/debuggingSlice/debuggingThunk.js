// debugging slice thunk
import {setSelectedTraceEntryIndex} from "./debuggingSlice";

export const setSelectedTraceEntryIndexThunk = (entryIndex) => (dispatch, getState) => {
    if (entryIndex === undefined || entryIndex === null) {
        console.warn("Invalid trace ID provided.");
        return;
    }
    dispatch(setSelectedTraceEntryIndex(entryIndex));
};
