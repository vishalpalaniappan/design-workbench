/* eslint-disable max-len */
import React, {useCallback, useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";
import {Floppy, Play} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";

import {useDalEngine} from "../../../Providers/GlobalProviders";
import {useServer} from "../../../Providers/GlobalProviders";
import {setStatusMsg} from "../../../Store/appSlice";
import {selectBehaviorThunk} from "../../../Store/appThunk";
import {setTransformOutput} from "../../../Store/scriptingSlice/scriptingSlice";
import {setTransformOutputLog} from "../../../Store/scriptingSlice/scriptingSlice";
import {useScriptingBehaviors} from "../../../Store/scriptingSlice/useScriptingSelection";
import {useSelectedTransformationTest} from "../../../Store/scriptingSlice/useScriptingSelection";
import {useSelectedBehavior} from "../../../Store/useAppSelection";

import "./ScriptingToolBar.scss";

ScriptingToolBar.propTypes = {
    close: PropTypes.func.isRequired,
    args: PropTypes.object.isRequired,
};

/**
 * Initial World State Editor modal body component.
 * @return {JSX.Element}
 */
export function ScriptingToolBar () {
    const behavior = useSelectedBehavior();
    const {sendMessage} = useServer();
    const {engine} = useDalEngine();
    const dispatch = useDispatch();
    const workerRef = useRef(null);
    const [result, setResult] = useState(null);
    const {behaviors} = useScriptingBehaviors();
    const [selectedBehavior, setSelectedBehavior] = useState(null);
    const selectedTransformationTest = useSelectedTransformationTest();

    const saveDesign = useCallback(() => {
        if (engine) {
            engine.save();
            dispatch(setStatusMsg("Saving design..."));
        }
    }, [engine, dispatch]);

    useEffect(() => {
        if (behaviors.length > 0 && selectedBehavior) {
            console.log("Selected Behavior:", selectedBehavior);
            const behavior = behaviors.find((b) => b.dal_engine_uid === selectedBehavior);
            // TODO: Migrate thunk to use UID instead of behavior name, this
            // is a bad idea to use name as an identifier.
            if (behavior) {
                dispatch(selectBehaviorThunk(behavior.getName()));
            } else {
                console.warn(`Behavior with ID ${selectedBehavior} not found.`);
            }
            addLog(null, true);
        }
    }, [behaviors, selectedBehavior]);

    useEffect(() => {
        if (behaviors.length > 0 && !selectedBehavior) {
            setSelectedBehavior(behaviors[0].dal_engine_uid);
        }
    }, [behaviors]);

    let logs = [];
    const addLog = useCallback((message, clear) => {
        if (clear) {
            logs = [];
        } else {
            const timestamp = new Date().toISOString();
            logs.push({timestamp, message});
        }
        dispatch(setTransformOutputLog([...logs]));
    }, [dispatch]);

    const runTransformation = useCallback((e) => {
        dispatch(setTransformOutput(null));
        addLog(null, true);
        // I decided to run transformations in worker for the current iteration.
        if (!selectedTransformationTest) return;
        if (!behavior) return;
        if (!engine) return;

        addLog("Initiating transformation");

        let _initialWorldState;
        let _expectedPostWorldState;
        let _initialArgs;
        let _script;

        try {
            _initialWorldState = JSON.parse(selectedTransformationTest.initialWorldState);
            addLog("Loaded Initial World State.");
        } catch (error) {
            addLog("Error parsing initial world state.");
            addLog(`Error: ${error.message}`);
            return;
        }

        try {
            _expectedPostWorldState = JSON.parse(selectedTransformationTest.expectedPostWorldState);
            addLog("Loaded Expected Post World State.");
        } catch (error) {
            addLog("Error parsing expected post world state.");
            addLog(`Error: ${error.message}`);
            return;
        }

        try {
            _initialArgs = JSON.parse(selectedTransformationTest.initialArgs);
            addLog("Loaded Initial Arguments.");
        } catch (error) {
            addLog("Error parsing initial arguments.");
            addLog(`Error: ${error.message}`);
            return;
        }

        try {
            _script = behavior._script;
            addLog("Loaded Script.");
        } catch (error) {
            addLog("Error loading script.");
            addLog(`Error: ${error.message}`);
            return;
        }

        try {
            engine.save();
            addLog("Saved Engine State.");
        } catch (error) {
            addLog("Error saving engine state.");
            addLog(`Error: ${error.message}`);
            return;
        }

        try {
            addLog("Firing up engine");
            addLog("Igniting thrusters - All Systems Go.");
            workerRef.current.postMessage({
                type: "RUN_TRANSFORMATION",
                payload: {
                    initialWorldState: _initialWorldState,
                    expectedPostWorldState: _expectedPostWorldState,
                    script: _script,
                    initialArgs: _initialArgs,
                },
            });
            addLog("Initiated transformation...Awaiting results.");
        } catch (error) {
            addLog("Error running transformation.");
            addLog(`Error: ${error.message}`);
            return;
        }
    }, [selectedTransformationTest, dispatch, engine, behavior]);


    useEffect(() => {
        workerRef.current = new Worker(
            new URL("./ScriptingWorker.js", import.meta.url),
            {type: "module"}
        );

        workerRef.current.onmessage = (event) => {
            setResult(event.data);
            if (event.data.type === "Success") {
                addLog("Transformation succeeded. See output state for details.");
                dispatch(setTransformOutput(event.data.payload.output));
            } else if (event.data.type === "Error") {
                console.error("Transformation error:", event.data.payload.error);
                addLog("Transformation failed.");
                addLog(`Error: ${event.data.payload.error}`);
            }
        };

        return () => {
            workerRef.current.terminate();
        };
    }, []);

    const runDesign = useCallback(() => {
        // Implement logic to run the entire design here.
        sendMessage({
            type: "terminal_run_design",
            payload: {
                designName: engine._name,
            },
        });
    }, [sendMessage]);

    return (
        // eslint-disable-next-line max-len
        <div className="scriptingToolBar">
            <div className="scriptingToolBarLeft">
                <span className="scriptingToolBarLabel">Behavior:</span>
                <select
                    value={selectedBehavior}
                    onChange={(e) => setSelectedBehavior(e.target.value)}>
                    {behaviors.map((behavior) => (
                        <option
                            key={behavior.dal_engine_uid}
                            value={behavior.dal_engine_uid}>
                            {behavior._name}
                        </option>
                    ))}
                </select>
                <span className="scriptingToolBarButton" onClick={runTransformation}>
                    <Play
                        size={20}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="scriptingToolBarButton">Compute Behavior</span>
                </span>

            </div>
            <div className="scriptingToolBarRight">
                <span className="scriptingToolBarButton" onClick={runDesign}>
                    <Play
                        size={20}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="scriptingToolBarButton">Run Design</span>
                </span>
                <span className="scriptingToolBarButton" onClick={saveDesign}>
                    <Floppy
                        size={14}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="scriptingToolBarButton">Save Design</span>
                </span>
            </div>
        </div>
    );
}
