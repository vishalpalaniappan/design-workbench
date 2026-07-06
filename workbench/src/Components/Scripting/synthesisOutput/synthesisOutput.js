import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";
import {useDispatch} from "react-redux";

import {setTransformOutput} from "../../../Store/scriptingSlice/scriptingSlice";
import {useTransformOutput} from "../../../Store/scriptingSlice/useScriptingSelection";
import {useSelectedBehavior} from "../../../Store/useAppSelection";

synthesisOutput.propTypes = {

};

/**
 * Transformation output meta.
 * @return {JSX.Element}
 */
export function SynthesisOutput ({}) {
    const dispatch = useDispatch();
    const transformOutput = useTransformOutput();
    const selectedBehavior = useSelectedBehavior();
    const editorRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!ready) return;
        if (editorRef.current && !transformOutput) {
            editorRef.current.setValue("");
        } else if (editorRef.current && transformOutput) {
            editorRef.current.setValue(
                JSON.stringify(transformOutput.synthPackage, null, 2)
            );
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
        dispatch(setTransformOutput(null));
        setReady(true);
    }, [dispatch]);

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
