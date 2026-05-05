/* eslint-disable max-len */
import React, {useCallback, useEffect, useState} from "react";

import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {setSelectedTraceEntryIndexThunk} from "../../../Store/debuggingSlice/debuggingThunk";
import {useSelectedTraceEntryIndex} from "../../../Store/debuggingSlice/useDebuggingSelection";
import {useTraces} from "../../../Store/useAppSelection";
import {useSelectedTraceId} from "../../../Store/useAppSelection";

import "./TraceBehaviorSelector.scss";

TraceBehaviorSelector.PropTypes = {
};

/**
 * Trace Behavior Selector component.
 * @return {JSX.Element}
 */
export function TraceBehaviorSelector () {
    const selectedTraceId = useSelectedTraceId();
    const selectedTraceEntryIndex = useSelectedTraceEntryIndex();
    const traces = useTraces();
    const dispatch = useDispatch();
    const [behaviors, setBehaviors] = useState([]);
    const [selectedBehavior, setSelectedBehavior] = useState(null);

    /**
     * TODO: I am not implementing it now but the UI can provide
     * a higher level selected of atomic execution groups and then
     * drill down into the behaviors based on the selected group.
     */
    useEffect(() => {
        if (selectedTraceId && traces) {
            setBehaviors([]);
            const trace = Object.values(traces).find((t) => t.uid === selectedTraceId);
            if (!trace) {
                console.warn(`Trace with id ${selectedTraceId} not found or has no executableModelOutput`);
                return;
            };
            if (!trace?.debugger?._executableSemanticModelOutputs) {
                console.warn("The executable model outputs were not found in the debugger");
                return;
            };
            const atomicBehavioralTraces = trace.debugger._executableSemanticModelOutputs;
            setBehaviors(atomicBehavioralTraces);
            dispatch(setSelectedTraceEntryIndexThunk({
                atomicIndex: 0,
                entryIndex: 0,
            }));
        } else {
            setBehaviors([]);
        }
    }, [selectedTraceId, dispatch, traces]);

    useEffect(() => {
        if (behaviors.length > 0 && selectedTraceEntryIndex !== null) {
            const i = selectedTraceEntryIndex;
            setSelectedBehavior(behaviors[i.atomicIndex][i.entryIndex]);
        }
    }, [selectedTraceEntryIndex, behaviors]);

    const selectTraceEntry = useCallback((atomicIndex, entryIndex) => {
        /**
         * 2-d Array with first dimension being atomic execution index
         * and the second is the entry index, I save both to access the
         * selected behavior.
         */
        dispatch(setSelectedTraceEntryIndexThunk({
            atomicIndex,
            entryIndex,
        }));
    }, [dispatch]);

    const getBehaviorStyle = useCallback((atomicIndex, index) => {
        const i = selectedTraceEntryIndex;
        if (i && atomicIndex === i.atomicIndex && index === i.entryIndex) {
            return {
                backgroundColor: "#522b19",
                borderBottom: "none",
            };
        }
    }, [traces, behaviors, selectedTraceEntryIndex, selectedBehavior]);

    return (
        <div className="traceBehaviorSelector">
            {behaviors.map((atomic, atomicIndex) => {
                return <React.Fragment key={atomicIndex}>
                    {atomic.map((entry, index) => {
                        return <div className="traceBehaviorRow" key={index}>
                            <div key={index}
                                className="traceBehaviorSelectorItem"
                                style={getBehaviorStyle(atomicIndex, index)}
                                onClick={() => selectTraceEntry(atomicIndex, index)}>
                                <div className="traceBehaviorSelectorName">
                                    {entry.behavior}
                                </div>
                                { (entry.output?.transformValidFlag === false && entry.output?.transformFailure === false) &&
                                    <div className="traceBehaviorTransformValidity">
                                        {"Invalid Implementation."}
                                    </div>
                                }
                                { (entry.output?.invariantsRespectedFlag === false) &&
                                    <div className="traceBehaviorInvariantViolations">
                                        {"World state violated invariants."}
                                    </div>
                                }
                                { (entry.output?.implementationFailure === true) &&
                                    <div className="traceBehaviorImplementationFailure">
                                        {"Execution Failure."}
                                    </div>
                                }
                            </div>
                        </div>;
                    })}
                    <div className="traceAtomicSeparator" />
                </React.Fragment>;
            })}
        </div>
    );
}
