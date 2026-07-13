// scripting slice thunk
import {selectScriptingBehaviorId} from "./scriptingSelectors";
import {incrementScriptingCounter} from "./scriptingSlice";
import {addTransformOutputLog} from "./scriptingSlice";
import {setTransformOutputLog} from "./scriptingSlice";

export const updateTransformationTestThunk = (type, value) => (dispatch, getState, {engine}) => {
    const state = getState();
    const behaviorId = selectScriptingBehaviorId(state);
    const behavior = engine.getNode(behaviorId).getBehavior();
    const transformationTest = behavior.getTransformationTests();

    if (!Array.isArray(transformationTest) || transformationTest.length === 0) {
        console.warn("No transformation test found for selected behavior, cannot update.");
        return;
    }

    const test = transformationTest[0];
    switch (type) {
        case "initialWorldState":
            test.initialWorldState = value;
            break;
        case "expectedPostWorldState":
            test.expectedPostWorldState = value;
            break;
        case "initialArgs":
            test.initialArgs = value;
            break;
        default:
            console.warn(`Unknown transformation test field: ${type}`);
    }

    dispatch(incrementScriptingCounter());
};


export const updateScriptingPrimitiveThunk = (value) => (dispatch, getState, {engine}) => {
    const state = getState();
    const behaviorId = selectScriptingBehaviorId(state);
    const behavior = engine.getNode(behaviorId).getBehavior();

    if (!behavior) {
        console.warn("No behavior found for selected behavior ID, cannot update primitives.");
        return;
    }

    behavior.setScript(value);

    dispatch(incrementScriptingCounter());
};


export const updateOutputLogsThunk = (value, clear) => (dispatch, getState, {engine}) => {
    const state = getState();
    const behaviorId = selectScriptingBehaviorId(state);
    const behavior = engine.getNode(behaviorId).getBehavior();

    if (!behavior) {
        console.warn("No behavior found for selected behavior ID, cannot update output logs.");
        return;
    }

    if (clear) {
        dispatch(setTransformOutputLog([]));
    } else {
        dispatch(addTransformOutputLog(value));
    }

    dispatch(incrementScriptingCounter());
};
