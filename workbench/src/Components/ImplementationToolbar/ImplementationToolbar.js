/* eslint-disable max-len */
import React, {useCallback, useEffect, useState} from "react";

import {Floppy, Play} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";

import {useDalEngine} from "../../Providers/GlobalProviders";
import {useServer} from "../../Providers/GlobalProviders";
import {setStatusMsg} from "../../Store/appSlice";
import {useHasEntryPoint} from "../../Store/useAppSelection";
import {useTraces} from "../../Store/useAppSelection";

import "./ImplementationToolbar.scss";

ImplementationToolbar.propTypes = {
};

/**
 * Implementation Tool Bar component.
 * @return {JSX.Element}
 */
export function ImplementationToolbar () {
    const dispatch = useDispatch();
    const {engine} = useDalEngine();
    const {sendMessage} = useServer();
    const hasEntryPoint = useHasEntryPoint();
    const traces = useTraces();
    const [selectedTrace, setSelectedTrace] = useState(null);

    const saveDesign = useCallback(() => {
        if (engine) {
            engine.save();
            dispatch(setStatusMsg("Saving design..."));
        }
    }, [engine, dispatch]);

    const runDesign = useCallback(() => {
        if (sendMessage && engine) {
            if (hasEntryPoint) {
                sendMessage({
                    type: "terminal_run_entry_point",
                    payload: {
                        entryPoint: engine.implementation.getEntryPoint(),
                        designName: engine._name,
                        selectedTrace: selectedTrace,
                    },
                });
            } else {
                const failureMsg = "Failed to run design. Please ensure an entry point is set.";
                sendMessage({
                    type: "terminal_run_entry_point",
                    payload: {
                        data: `echo ${failureMsg}`,
                        designName: engine._name,
                        selectedTrace: selectedTrace,
                    },
                });
            }
        }
    }, [sendMessage, hasEntryPoint, engine, selectedTrace]);


    const synthesizeDesign = useCallback(() => {
        const files = engine.implementation.getFiles();
        const entryPoint = engine.implementation.getEntryPoint();

        for (const file of files) {
            if (file._name === entryPoint) {
                file.generateAst();
                engine.save();
            }
        }
    }, [hasEntryPoint, engine]);

    return (
        <div className="mainToolBar">
            <div className="mainToolBarLeft">
                {/* Temporary Changes to Name */}
                <span className="mainToolBarLabel">Design</span>
            </div>
            <div className="mainToolBarRight">
                <span className="mainToolBarLabel">Select Environment:</span>
                <span className="mainToolBarSelect" >
                    <select
                        value={selectedTrace}
                        onChange={(e) => setSelectedTrace(e.target.value)}>
                        <option key={"none"} value={null}>None</option>
                        {
                            traces && Object.values(traces).map((trace) => (
                                <option key={trace.uid} value={trace.uid}>{
                                    (trace?.name ? trace.name : trace.timestamp)
                                }</option>
                            ))
                        }
                    </select>
                </span>
                <span className="mainToolBarButton" onClick={synthesizeDesign}>
                    <Play
                        size={20}
                        className="mainToolBarButton"
                        style={{"color": "white", "cursor": "pointer", "padding": "0 5px"}}/>
                    <span >Synthesize Design</span>
                </span>
                <span className="mainToolBarButton" onClick={runDesign}>
                    <Play
                        size={20}
                        className="mainToolBarButton"
                        style={{"color": "white", "cursor": "pointer", "padding": "0 5px"}}/>
                    <span >Run Design</span>
                </span>

                <span className="mainToolBarButton" onClick={saveDesign}>
                    <Floppy
                        size={14}
                        className="mainToolBarButton"
                        style={{"color": "white", "cursor": "pointer", "padding": "0 5px"}}/>
                    <span>Save</span>
                </span>
            </div>
        </div>
    );
}
