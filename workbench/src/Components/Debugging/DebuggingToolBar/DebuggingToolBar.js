import React, {useCallback, useEffect, useState} from "react";

import PropTypes from "prop-types";
import {Floppy, Pencil} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";
import {useModalManager} from "ui-layout-manager-dev";

import {useDalEngine} from "../../../Providers/GlobalProviders";
import {setSelectedTraceIdThunk} from "../../../Store/appThunk";
import {useTraces} from "../../../Store/useAppSelection";
import {AddTraceName} from "../../Modals/AddTraceName";

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
    const {openModal} = useModalManager();
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
            setSelectedTrace(filteredTraces[0].uid);
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

    const setTraceName = useCallback(() => {
        if (selectedTrace) {
            openModal({
                title: "Set Trace Name",
                args: {
                    trace: selectedTrace,
                },
                render: ({close, args}) => {
                    return <AddTraceName close={close} args={args} />;
                },
            });
        }
    }, [selectedTrace, traces, openModal]);

    return (
        <div className="debuggingToolBar">
            <div className="debuggingToolBarLeft">
                <span className="debuggingToolBarLabel">Debug:</span>
                <span className="debuggingToolBarSelect" >
                    <select
                        value={traceType}
                        onChange={(e) => setTraceType(e.target.value)}>
                        <option key={"semantic"} value={"design"}>Semantic Model</option>
                        <option key={"implementation"} value={"implementation"}>
                            Implementation
                        </option>
                    </select>
                </span>
                <span className="debuggingToolBarLabel">Select Trace:</span>
                <span className="debuggingToolBarSelect" >
                    <select
                        value={selectedTrace}
                        onChange={(e) => setSelectedTrace(e.target.value)}>
                        {filteredTraces.map((trace) => (
                            <option key={trace.uid} value={trace.uid}>{
                                (trace?.name ? trace.name : trace.timestamp)
                            }</option>
                        ))}
                    </select>
                </span>
            </div>
            <div className="debuggingToolBarRight">
                <span className="debuggingToolBarButton" onClick={setTraceName}>
                    <Pencil
                        size={14}
                        style={{"color": "white", "cursor": "pointer", "padding": "0 5px"}}/>
                    <span>Set Trace Name</span>
                </span>
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
