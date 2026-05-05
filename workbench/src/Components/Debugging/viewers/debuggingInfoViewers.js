import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";

import {useDalEngine} from "../../../Providers/GlobalProviders";
import {useSelectedTraceEntryIndex} from "../../../Store/debuggingSlice/useDebuggingSelection";
import {useTraces} from "../../../Store/useAppSelection";
import {useSelectedTraceId} from "../../../Store/useAppSelection";

import "./debuggingInfoViewers.scss";

DebuggingInfoViewer.propTypes = {
    type: PropTypes.string.isRequired,
    initial: PropTypes.object,
    isJson: PropTypes.bool,
};

/**
 * Debugging info viewer.
 * @param {Object} props
 *
 * @return {JSX.Element}
 */
function DebuggingInfoViewer ({type, isJson = true}) {
    const selectedTraceEntryIndex = useSelectedTraceEntryIndex();
    const selectedTraceId = useSelectedTraceId();
    const traces = useTraces();
    const editorRef = useRef(null);
    const [ready, setReady] = useState(false);
    const {engine} = useDalEngine();

    useEffect(() => {
        if (ready && traces) {
            // If there is no selected trace, we clear the viewer.
            if (selectedTraceId === null || selectedTraceId === undefined) {
                editorRef.current.setValue("");
                return;
            }

            // If no trace entry is selected, then we also clear the viewer.
            if (selectedTraceEntryIndex === null || selectedTraceEntryIndex === undefined) {
                editorRef.current.setValue("");
                return;
            }

            const ind = selectedTraceEntryIndex;
            // Invalid index, clear the viewer and return.
            if (ind === null || ind.atomicIndex === undefined || ind.entryIndex === undefined) {
                console.warn("Invalid trace entry index.");
                editorRef.current.setValue("");
                return;
            }

            const trace = Object.values(traces).find((t) => t.uid === selectedTraceId);
            // If the trace is not found, we clear the viewer and return.
            if (!trace) {
                console.warn(`Trace with id ${selectedTraceId} not found`);
                editorRef.current.setValue("");
                return;
            };

            // If the trace doesn't have results, clear the viewer and return.
            if (!trace?.computedResults) {
                // eslint-disable-next-line max-len
                console.warn("The result of the semantic validator used to populate the UI was not found in the debugger");
                editorRef.current.setValue("");
                return;
            }

            // Result of the semantic validator used to populate the UI. It
            // contains both the inputs and the outputs.
            const computedResult = trace.computedResults;

            if (type === "transformOutput") {
                // Transformation output is saved in the executableModelOutput
                // in the validation step of the transform section.
                console.log(computedResult, ind);
                const entry = computedResult[ind.atomicIndex][ind.entryIndex];
                if ("transform" in entry.output) {
                    const validate = entry.output.transform.find((v) => v.type === "validate");
                    const output = validate ? validate.transformationOutput : null;
                    editorRef.current.setValue(
                        output ? JSON.stringify(output, null, 2) : ""
                    );
                }
            } else if (type === "transformOutputMetadata") {
                const entry = computedResult[ind.atomicIndex][ind.entryIndex];
                editorRef.current.setValue(JSON.stringify(entry, null, 4));
            } else if (type === "script") {
                // Script is in the behavior, so we find it and get the script.
                const entry = computedResult[ind.atomicIndex][ind.entryIndex];
                const b = engine.graphs.getAllBehaviors().find(
                    (b) => b.getName() === entry.behavior
                );
                editorRef.current.setValue(b ? b._script : "");
            } else {
                // For other types, we look into the processed trace entry.
                const entry = computedResult[ind.atomicIndex][ind.entryIndex];
                if (entry && "input" in entry && type in entry.input) {
                    const value = entry.input[type];
                    editorRef.current.setValue(
                        isJson ? JSON.stringify(value, null, 2) : String(value)
                    );
                }
            }
        }
    }, [selectedTraceId, engine, ready, type, traces, selectedTraceEntryIndex]);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        setReady(true);
    }, [type]);

    return (
        <div style={{width: "100%", height: "100%"}}>
            <Editor
                defaultLanguage={isJson ? "json" : "plaintext"}
                defaultValue=""
                theme="vs-dark"
                readOnly={true}
                onMount={handleEditorMount}
                options={{
                    minimap: {enabled: false},
                    lineNumbers: "off",
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    readOnly: true,
                }}
            />
        </div>
    );
}

export const DebuggerBehaviorInitialArgs = (props) => (
    <DebuggingInfoViewer type="arguments" {...props} />
);
export const DebuggerBehaviorInitialWorldState = (props) => (
    <DebuggingInfoViewer type="preWorldState" {...props} />
);
export const DebuggerBehaviorExpectedPostWorldState = (props) => (
    // eslint-disable-next-line max-len
    <DebuggingInfoViewer type="postWorldState" {...props} />
);
export const DebuggerBehaviorTransformOutput = (props) => (
    <DebuggingInfoViewer type="transformOutput" {...props} />
);
export const DebuggerBehaviorScript = (props) => (
    <DebuggingInfoViewer type="script" {...props} />
);
export const DebuggerTransformOutputMetadata = (props) => (
    <DebuggingInfoViewer type="transformOutputMetadata" {...props} />
);
