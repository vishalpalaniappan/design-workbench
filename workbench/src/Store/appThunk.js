import {setActiveTab} from "./appSlice";
import {incrementCounter} from "./appSlice";
import {setHasEntryPoint} from "./appSlice";
import {setSelectedTraceId} from "./appSlice";
import {setSelectedBehavior} from "./appSlice";

/**
 * Called to delete a file given a file ID.
 * @param {string} fileId - The ID of the file to delete.
 * @return {Function} Thunk function.
 */
export const deleteFileThunk = (fileId) => (dispatch, getState, {engine}) => {
    const files = engine.getFiles();
    const index = files.findIndex((file) => file.uid === fileId);
    let newUid = null;
    if (index === 0 && files.length > 1) {
        newUid = files[index + 1].uid;
    } else if (index > 0) {
        newUid = files[index - 1].uid;
    }
    engine.removeFile(fileId);
    dispatch(setActiveTab(newUid));
    dispatch(incrementCounter());
};

/**
 * Called to add a file given a file name.
 * @param {String} fileName - The name of the file to add.
 * @return {Function} Thunk function.
 */
export const addFileThunk = (fileName) => (dispatch, getState, {engine}) => {
    const newFile = engine.addFile(fileName, fileName, "");
    dispatch(setActiveTab(newFile.uid));
    dispatch(incrementCounter());
};

/**
 * Sets the active tab.
 * @param {String} activeTab - Identifier for the active tab.
 * @return {Function} Thunk functin.
 */
export const setActiveTabThunk = (activeTab) => (dispatch, getState, {workbench}) => {
    dispatch(setActiveTab(activeTab.uid));
    dispatch(incrementCounter());
};

/**
 * Sets whether the design has an entry point, which enables or disables the run
 * button and functionality.
 * @param {Boolean} hasEntryPoint Whether the design has an entry point.
 * @return {Function} Thunk function.
 */
export const setHasEntryPointThunk = (hasEntryPoint) => (dispatch, getState, {engine}) => {
    dispatch(setHasEntryPoint(hasEntryPoint));
    dispatch(incrementCounter());
};


/**
 * Sets updated content for a file given the file ID and the updated content.
 * @param {String} fileId ID of the file to update.
 * @param {String} content Updated content for the file.
 * @return {Function} Thunk function.
 */
export const setUpdatedContentThunk = (fileId, content) => (dispatch, getState, {workbench}) => {
    try {
        workbench.setUpdatedContent(fileId, content);
    } catch (e) {
        console.error("Failed to save updated content");
        return;
    }
};


/**
 * Sets the selected trace ID. Trace ID will be null if no trace is selected.
 * @param {String} traceId Trace ID to set as selected.
 * @return {Function} Thunk function.
 */
export const setSelectedTraceIdThunk = (traceId) => (dispatch, getState, {engine}) => {
    dispatch(setSelectedTraceId(traceId));
};

/**
 * Adds a trace to the engine.
 * @param {Object} trace Trace object to add.
 * @return {Function} Thunk function.
 */
export const addTraceThunk = (trace) => (dispatch, getState, {engine}) => {
    engine.traces.addTrace(trace, false, []);
    dispatch(incrementCounter());
};

/**
 * Removes a trace from the engine given the trace ID.
 * @param {String} traceId Trace ID to remove from the engine.
 * @return {Function} Thunk function.
 */
export const deleteTraceThunk = (traceId) => (dispatch, getState, {engine}) => {
    dispatch(setSelectedTraceId(null));
    engine.traces.deleteTrace(traceId);
    dispatch(incrementCounter());
    engine.save();
};

export const selectBehaviorThunk = (behavior) => (dispatch, getState, {workbench}) => {
    dispatch(setSelectedBehavior(behavior));
    console.log("Selected bheavior:", behavior);
};
