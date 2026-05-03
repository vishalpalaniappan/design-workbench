import React, {useCallback, useEffect, useState} from "react";

import PropTypes from "prop-types";
import {Floppy} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";

import {useDalEngine} from "../../../Providers/GlobalProviders";
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
    const {engine} = useDalEngine();
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

    const saveDesign = useCallback(() => {
        if (engine) {
            engine.save();
            dispatch(setStatusMsg("Saving design..."));
        }
    }, [engine, dispatch]);

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
        <div className="debuggingToolBar">
            <div className="debuggingToolBarLeft">
                <span className="debuggingToolBarLabel">Debug:</span>
                <span className="debuggingToolBarSelect" >
                    <select
                        value={traceType}
                        onChange={(e) => setTraceType(e.target.value)}>
                        <option key={"semantic"} value={"design"}>Semantic Model</option>
                        <option key={"implementation"} value={"implementation"}>Implementation</option>
                    </select>
                </span>
                <span className="debuggingToolBarLabel">Select Trace:</span>
                <span className="debuggingToolBarSelect" >
                    <select
                        value={selectedTrace}
                        onChange={(e) => setSelectedTrace(e.target.value)}>
                        {filteredTraces.map((trace) => (
                            <option key={trace.uid} value={trace.uid}>{trace.timestamp}</option>
                        ))}
                    </select>
                </span>
            </div>
            <div className="debuggingToolBarRight">
                <span className="debuggingToolBarButton" onClick={saveDesign}>
                    <Floppy
                        size={14}
                        style={{"color": "white", "cursor": "pointer", "padding": "0 5px"}}/>
                    <span>Save</span>
                </span>
            </div>
        </div>
    );
}
