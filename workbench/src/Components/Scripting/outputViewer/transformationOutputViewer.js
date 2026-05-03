import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";

import {useTransformOutput} from "../../../Store/scriptingSlice/useScriptingSelection";
import {useSelectedBehavior} from "../../../Store/useAppSelection";

TransformationOutputViewer.propTypes = {

};

/**
 * Transformation output viewer.
 * @return {JSX.Element}
 */
export function TransformationOutputViewer ({}) {
    const transformOutput = useTransformOutput();
    const selectedBehavior = useSelectedBehavior();
    const editorRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!ready) return;
        if (editorRef.current && !transformOutput) {
            editorRef.current.setValue("");
        } else if (editorRef.current && transformOutput) {
            if ("transform" in transformOutput) {
                const validateEntry = transformOutput.transform.find(
                    (entry) => entry.type === "validate"
                );
                editorRef.current.setValue(
                    validateEntry ? JSON.stringify(validateEntry.transformationOutput, null, 2) : ""
                );
            }
        }
    }, [transformOutput, ready]);

    useEffect(() => {
        if (editorRef.current && !selectedBehavior) {
            editorRef.current.setValue("");
        }
    }, [selectedBehavior]);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => {});
        setReady(true);
    }, [transformOutput]);

    return (
        <div style={{width: "100%", height: "100%"}}>
            <Editor
                defaultLanguage="json"
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
};
