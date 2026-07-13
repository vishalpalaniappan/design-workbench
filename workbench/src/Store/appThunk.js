import {saveInvariantPropValues} from "../helpers/helper";
import {setActiveTab, setSelectedMapping} from "./appSlice";
import {setSelectedGraph} from "./appSlice";
import {incrementCounter} from "./appSlice";
import {setSelectedParticipant} from "./appSlice";
import {setSelectedBehavior} from "./appSlice";
import {setSelectedInvariant} from "./appSlice";
import {setHasEntryPoint} from "./appSlice";
import {setSelectedTraceId} from "./appSlice";
import {setSelectedTraceEntryIndex} from "./debuggingSlice/debuggingSlice";

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
    dispatch(setActiveTab(newFile._uid));
    dispatch(incrementCounter());
};

/**
 * Called to select a participant given a participant name.
 * @param {String} participantName - Name of the participant.
 * @return {Function} Thunk function.
 */
export const selectParticipantThunk = (participantName) => (dispatch) => {
    dispatch(setSelectedParticipant(participantName));
};

/**
 * Called to add a participant given a name and description.
 * @param {String} name - Name of the participant.
 * @param {String} description - Description of the participant.
 * @return {Function} Thunk function.
 */
export const addParticipantThunk = (name, description) => (dispatch, getState, {engine}) => {
    const selectedBehaviorId = getState().app.selectedBehavior;
    if (!selectedBehaviorId) {
        throw new Error("No behavior selected");
    }
    const behavior = engine.getNode(selectedBehaviorId).getBehavior();
    const participantInstance = engine.createParticipant({
        name: name, description: description,
    });
    behavior.addParticipant(participantInstance);
    dispatch(setSelectedParticipant(name));
    dispatch(incrementCounter());
};

/**
 * Called to delete a participant given a participant ID.
 * @param {String} participantId - The ID of the participant to delete.
 * @return {Function} Thunk function.
 */
export const deleteParticipantThunk = (participantId) => (dispatch, getState, {engine}) => {
    const selectedBehaviorId = getState().app.selectedBehavior;
    if (!selectedBehaviorId) {
        throw new Error("No behavior selected");
    }
    const behavior = engine.getNode(selectedBehaviorId).getBehavior();
    behavior.removeParticipant(participantId);
    const p = behavior.getParticipants();
    if (p.length > 0) {
        dispatch(setSelectedParticipant(p[0].getName()));
    } else {
        dispatch(setSelectedParticipant(null));
    }
    dispatch(incrementCounter());
};

/**
 * Adds an invariant to the selected participant with the given information.
 * @param {String} name Name of the invariant.
 * @param {String} description Description of the invariant.
 * @param {Object} invariantType Type of the invariant (e.g. minLength etc).
 * @param {Object} invariantTypeProps Properties for the invariant type.
 * @return {Function} Thunk function.
 */
// eslint-disable-next-line max-len
export const addInvariantThunk = ({name, description, invariantType, invariantTypeProps}) => (dispatch, getState, {engine}) => {
    if (!name || name.trim() === "") {
        throw new Error("Invariant name must not be empty.");
    }
    const participantId = getState().app.selectedParticipant;
    const selectedBehaviorId = getState().app.selectedBehavior;
    if (!selectedBehaviorId) {
        throw new Error("No behavior selected");
    }
    const behavior = engine.getNode(selectedBehaviorId).getBehavior();
    const participant = behavior.getParticipant(participantId);
    if (!participant) {
        throw new Error("No participant selected");
    }

    // Create invariant and assign invariant type
    const invariant = engine.createInvariant({name: name, description: description});
    invariant.invariantType = invariantType;

    // Save invariant property values to the invariant type
    saveInvariantPropValues(invariant, invariantTypeProps);

    participant.addInvariant(invariant);
    dispatch(setSelectedParticipant(participantId));
    dispatch(setSelectedInvariant(invariant.getName()));
    dispatch(incrementCounter());
};

/**
 * Deletes an invariant given its ID.
 * @param {String} invariantId - The ID of the invariant to delete.
 * @return {Function} Thunk function.
 */
export const deleteInvariantThunk = (invariantId) => (dispatch, getState, {engine}) => {
    const participantId = getState().app.selectedParticipant;
    const selectedBehaviorId = getState().app.selectedBehavior;
    if (!selectedBehaviorId) {
        throw new Error("No behavior selected");
    }
    const behavior = engine.getNode(selectedBehaviorId).getBehavior();
    const participant = behavior.getParticipant(participantId);
    if (!participant) {
        throw new Error("No participant selected");
    }
    participant.removeInvariant(invariantId);
    dispatch(setSelectedParticipant(participantId));
    dispatch(setSelectedInvariant(null));
    dispatch(incrementCounter());
};

/**
 * Graph thunk for adding a graph to the engine and updating the active tab.
 * @param {String} graphName Graph name.
 * @return {Function} Thunk function.
 */
export const addGraphThunk = (graphName) => (dispatch, getState, {engine}) => {
    engine.createGraph(graphName);
    dispatch(setSelectedGraph(engine.graphs.getActiveGraph().name));
    dispatch(incrementCounter());
};

/**
 * Graph thunk for deleting a graph from the engine and updating the active tab.
 * @param {String} graphName Graph name.
 * @return {Function} Thunk function.
 */
export const deleteGraphThunk = (graphName) => (dispatch, getState, {engine}) => {
    engine.removeGraph(graphName);
    dispatch(setSelectedGraph(engine.graphs.getActiveGraph().name));
    dispatch(setSelectedBehavior(null));
    dispatch(incrementCounter());
};

/**
 * Selects a behavior given its ID and updates the selected participant to 
 * the first participant of the behavior if it exists.
 * @param {String} behaviorId String ID of the behavior to select.
 * @return {Function} Thunk function.
 */
export const selectBehaviorThunk = (behaviorId) => (dispatch, getState, {engine}) => {
    if (!behaviorId) {
        dispatch(setSelectedBehavior(null));
        return;
    }
    const behavior = engine.getNode(behaviorId).getBehavior();
    dispatch(setSelectedBehavior(behaviorId));
    const participants = behavior.getParticipants();
    if (participants.length > 0) {
        dispatch(setSelectedParticipant(participants[0].getName()));
    } else {
        dispatch(setSelectedParticipant(null));
    }
    dispatch(setSelectedMapping(null));
};

/**
 * Adds a behavior to the engine.
 * @param {Object} args Arguments for adding a behavior, including:
 * @param {String} args.name Name of the behavior.
 * @param {String} args.description Description of the behavior.
 * @param {Boolean} args.isAtomic Is the behavior atomic?
 * @param {Boolean} args.isDesignFork Is the behavior a fork in the design?
 * @returns {Function} Thunk function.
 */
// eslint-disable-next-line max-len
export const addBehaviorThunk = (args) => (dispatch, getState, {engine}) => {
    const {name, description, isAtomic, isDesignFork} = args;
    if (!name || name.trim() === "") {
        throw new Error("Behavior name must not be empty.");
    }
    const newNode = engine.addNode(name, description, [], isAtomic, isDesignFork);
    dispatch(setSelectedBehavior(newNode.getBehavior().getName()));
    dispatch(incrementCounter());
};

/**
 * Deletes a behavior given its ID, removes its mapping from files,
 * and updates the selected behavior and participant.
 * @param {String} behaviorId String ID of the behavior to delete.
 * @return {Function} Thunk function.
 */
export const deleteBehaviorThunk = (behaviorId) => (dispatch, getState, {engine}) => {
    engine.removeNode(behaviorId);
    // Remove behavior from any mapping in files
    engine.getFiles().forEach((file) => {
        if (!file.mapping) return;
        const mapping = file.mapping;
        for (const entry of mapping) {
            if (entry.behaviorId === behaviorId) {
                entry.behaviorId = null;
            }
        }
    });
    dispatch(setSelectedBehavior(null));
    dispatch(setSelectedParticipant(null));
    dispatch(setSelectedInvariant(null));
    dispatch(setSelectedMapping(null));
    dispatch(incrementCounter());
};

/**
 * Maps the clicked statement to the selected behavior.
 * @param {Object} statement Statement object for mapping.
 * @return {Function} Thunk function.
 */
export const mapStatementToBehaviorThunk = (statement) => (dispatch, getState, {engine}) => {
    const selectedBehaviorId = getState().app.selectedBehavior;
    const selectedActiveTabId = getState().app.activeTab;
    if (!selectedBehaviorId) {
        console.info("No behavior selected, cannot map statement to behavior.");
        return;
    }

    const file = engine.getFile(selectedActiveTabId);
    if (!file) {
        console.error("File not found in engine files");
        return;
    }

    // TODO: Check if statement is mapped onto other behavior.

    if (file.getMappedStatement(statement.uid)?.getBehavior() === selectedBehaviorId) {
        file.setBehavior(statement.uid, null);
    } else {
        file.setBehavior(statement.uid, selectedBehaviorId);
    }
    dispatch(incrementCounter());
};

/**
 * Sets the selected abstraction id.
 * @param {String} abstraction See useSelectedBehaviorAbstractions selector.
 * @return {Function} Thunk function.
 */
export const selectMappingThunk = (abstraction) => (dispatch, getState, {engine}) => {
    dispatch(setSelectedMapping(abstraction));
    dispatch(incrementCounter());
};

/**
 * Deletes the mapping. There are two types of mapping:
 * - A behavior onto an statement in the file.
 * - A participant onto a variable name in an statement in the file.
 * @param {Object} abstraction See useSelectedBehaviorAbstractions selector.
 * @return {Function} Thunk function.
 */
export const deleteMappingThunk = (abstraction) => (dispatch, getState, {engine}) => {
    const selectedParticipantId = getState().app.selectedParticipant;
    const selectActiveTabId = getState().app.activeTab;
    const file = engine.getFile(selectActiveTabId);

    if (!file) {
        console.error("File not found in engine files");
        return;
    }

    if (abstraction.type === "behavior") {
        file.clearBehavior(abstraction.uid);
    } else if (abstraction.type === "participant") {
        file.removeParticipant(abstraction.uid, selectedParticipantId);
    }

    dispatch(setSelectedMapping(null));
    dispatch(incrementCounter());
};

/**
 * Maps an abstraction to the selected participant.
 * @param {String} abstractionId ID of the abstraction to map.
 * @param {String} variableName Variable name to map the abstraction to.
 * @return {Function} Thunk function.
 */
export const mapAbstractionThunk = ({absId, varName}) => (dispatch, getState, {engine}) => {
    const selectedBehaviorId = getState().app.selectedBehavior;
    const selectedParticipantId = getState().app.selectedParticipant;
    const selectedFileId = getState().app.activeTab;
    if (!selectedBehaviorId || !selectedParticipantId) {
        console.info("No behavior or participant selected, cannot map abstraction.");
        return;
    }

    // Map the participant+varName to the statement in the source file.
    const file = engine.getFile(selectedFileId);

    if (!file) {
        console.error("File not found in engine files");
        return;
    }
    file.setParticipant(absId, selectedParticipantId, varName);

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
export const setUpdatedContentThunk = (fileId, content) => (dispatch, getState, {engine}) => {
    let file;
    try {
        file = engine.getFile(fileId);
    } catch (e) {
        console.error("File not found in engine files");
        return;
    }
    file.setUpdatedContent(content);
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
    dispatch(setSelectedTraceEntryIndex(null));
    engine.traces.deleteTrace(traceId);
    dispatch(incrementCounter());
    engine.save();
};

/**
 * Adds a failure prediction to the selected invariant.
 * @param {Object} predictedBehavior Behavior object that will fail
 * @param {String} description Description of the prediction.
 * @return {Function} Thunk function.
 */
export const addPredictionThunk = (predictedBehavior, description) =>
    (dispatch, getState, {engine}) => {
        const selectedBehaviorId = getState().app.selectedBehavior;
        if (!selectedBehaviorId) throw new Error("No behavior selected");

        const selectedParticipantId = getState().app.selectedParticipant;
        if (!selectedParticipantId) throw new Error("No participant selected");

        const selectedInvariant = getState().app.selectedInvariant;
        if (!selectedInvariant) throw new Error("No invariant selected");

        const behavior = engine.getNode(selectedBehaviorId).getBehavior();
        const participant = behavior.getParticipant(selectedParticipantId);
        const invariant = participant.getInvariant(selectedInvariant);

        invariant.addFailedBehaviorPrediction(
            predictedBehavior.dal_engine_uid,
            predictedBehavior.getName(),
            description
        );
        dispatch(incrementCounter());
};

/**
 * Removes a failure prediction from the selected invariant.
 * @param {String} uid UID of the behavior that will fail.
 * @return {Function} Thunk function.
 */
export const removePredictionThunk = (uid) => (dispatch, getState, {engine}) => {
    const selectedBehaviorId = getState().app.selectedBehavior;
    if (!selectedBehaviorId) throw new Error("No behavior selected");

    const selectedParticipantId = getState().app.selectedParticipant;
    if (!selectedParticipantId) throw new Error("No participant selected");

    const selectedInvariant = getState().app.selectedInvariant;
    if (!selectedInvariant) throw new Error("No invariant selected");

    const behavior = engine.getNode(selectedBehaviorId).getBehavior();
    const participant = behavior.getParticipant(selectedParticipantId);
    const invariant = participant.getInvariant(selectedInvariant);

    invariant.removeFailedBehaviorPrediction(uid);
    dispatch(incrementCounter());
};
