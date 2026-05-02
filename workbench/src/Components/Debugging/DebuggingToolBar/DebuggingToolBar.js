/* eslint-disable max-len */
import React, {useEffect, useState} from "react";

import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {setSelectedTraceIdThunk} from "../../../Store/appThunk";
import {useTraces} from "../../../Store/useAppSelection";

import "./DebuggingToolBar.scss";

DebuggingToolBar.propTypes = {
    close: PropTypes.func.isRequired,
    args: PropTypes.object.isRequired,
};

/**
 * Debugging Tool Bar component.
 * @return {JSX.Element}
 */
export function DebuggingToolBar () {
    const dispatch = useDispatch();
    const traces = useTraces();
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [traceType, setTraceType] = useState("design");
    const [filteredTraces, setFilteredTraces] = useState([]);

    useEffect(() => {
        if (traces && traceType) {
            const filtered = Object.values(traces).filter(
                (trace) => trace.type === traceType
            );
            console.log(filtered);
            setFilteredTraces(filtered);
        }
    }, [traces, traceType]);

    useEffect(() => {
        if (filteredTraces && filteredTraces.length > 0) {
            dispatch(setSelectedTraceIdThunk(filteredTraces[0].uid));
        } else {
            dispatch(setSelectedTraceIdThunk(null));
        }
    }, [filteredTraces]);

    useEffect(() => {
        if (selectedTrace) {
            console.log("Selected new trace:", selectedTrace);
            dispatch(setSelectedTraceIdThunk(selectedTrace));
        }
    }, [selectedTrace, dispatch]);
    return (
        // eslint-disable-next-line max-len
        <div className="debuggingToolBar">
            <div className="debuggingToolBarLeft">
                <div className="debuggingToolBarGroup">
                    <span className="debuggingToolBarLabel">Source:</span>
                    <select
                        value={traceType}
                        onChange={(e) => setTraceType(e.target.value)}>
                        <option key={"semantic"} value={"design"}>Semantic Model</option>
                        <option key={"implementation"} value={"implementation"}>Implementation</option>
                    </select>
                </div>
                <div className="debuggingToolBarGroup">
                    <span className="debuggingToolBarLabel">Select Trace:</span>
                    <select
                        value={selectedTrace}
                        onChange={(e) => setSelectedTrace(e.target.value)}>
                        {filteredTraces.map((trace) => (
                            <option key={trace.uid} value={trace.uid}>{trace.timestamp}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="debuggingToolBarRight"></div>
        </div>
    );
}
