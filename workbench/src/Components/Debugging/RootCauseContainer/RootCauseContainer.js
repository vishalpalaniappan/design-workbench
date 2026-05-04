/* eslint-disable max-len */
import React, {useEffect, useState} from "react";

import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {setSelectedTraceEntryIndexThunk} from "../../../Store/debuggingSlice/debuggingThunk";
import {useTraces} from "../../../Store/useAppSelection";
import {useSelectedTraceId} from "../../../Store/useAppSelection";

import "./RootCauseContainer.scss";

RootCauseContainer.propTypes = {
    close: PropTypes.func.isRequired,
    args: PropTypes.object.isRequired,
};

/**
 * Root Cause Container component.
 * @return {JSX.Element}
 */
export function RootCauseContainer () {
    const dispatch = useDispatch();
    const selectedTraceId = useSelectedTraceId();
    const [failures, setFailures] = useState([]);
    const traces = useTraces();

    const selectBehavior = (behavior) => {
        dispatch(setSelectedTraceEntryIndexThunk({
            atomicIndex: Number(behavior.index.atomicIndex),
            entryIndex: Number(behavior.index.entryIndex),
        }));
    };

    useEffect(() => {
        if (selectedTraceId && traces) {
            setFailures([]);
            const traceValues = Object.values(traces);
            const trace = traceValues.find((t) => t.uid === selectedTraceId);
            if (!trace) {
                console.warn(`Trace with id ${selectedTraceId} not found`);
                return;
            }
            if (trace?.debugger?._failures) {
                const failures = trace.debugger._failures;
                setFailures(failures);
            }
        } else {
            setFailures([]);
        }
    }, [selectedTraceId, traces]);

    return (
        <div>
            {
                failures && failures.map((f, index) => (
                    <div className="failureContainer" key={index}>
                        <div key={index} className="failureLabel" onClick={() => selectBehavior(f)}>
                            Failure: {f.behavior}
                        </div>
                        <div className="rootCauseContainer">
                            {
                                (f?.rootCauses && f.rootCauses.length > 0) ? f.rootCauses.map((rc, rcIndex) => (
                                    <div key={rcIndex} onClick={() => selectBehavior(rc)}>
                                        <div className="rootCauseLabel">Root Cause</div>
                                        <div key={rcIndex} className="rootCauseLabel" >Behavior: {rc.behavior}</div>
                                        <div className="rootCauseLabel">Invariant Violation: {rc.details.message}</div>
                                    </div>
                                )) :
                                    <React.Fragment>
                                        <div className="noRootCauseLabel">No root cause found. The design must learn new semantics to explain its observations.</div>
                                        <div className="noRootCauseLabel">Click here to add new semantics in learning mode (coming soon).</div>
                                    </React.Fragment>
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    );
}
