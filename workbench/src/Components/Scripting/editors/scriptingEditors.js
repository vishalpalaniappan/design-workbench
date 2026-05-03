import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {updateTransformationTestThunk} from "../../../Store/scriptingSlice/scriptingThunk";
import {useSelectedTransformationTest} from "../../../Store/scriptingSlice/useScriptingSelection";

import "./scriptingEditors.scss";

ScriptingEditor.propTypes = {
    type: PropTypes.string.isRequired,
    initial: PropTypes.object,
    isJson: PropTypes.bool,
};

/**
 * Scripting editor.
 * @param {Object} props
 * @param {string} props.type - The type of script to edit
 * (e.g., "initialArgs", "initialWorldState", etc.).
 * @param {Object} props.initial - The initial value of the script.
 * @param {boolean} props.isJson - Whether the content is JSON (default: true).
 * @return {JSX.Element}
 */
function ScriptingEditor ({type, initial, isJson = true}) {
    const dispatch = useDispatch();
    const [ready, setReady] = useState(false);
    const editorRef = useRef(null);
    const transformationTest = useSelectedTransformationTest();

    useEffect(() => {
        if (ready) {
            if (transformationTest) {
                if (!(type in transformationTest) || !transformationTest[type]) {
                    editorRef.current.setValue("");
                } else {
                    editorRef.current.setValue(transformationTest[type]);
                }
            } else {
                editorRef.current.setValue("");
            }
        }
    }, [transformationTest, initial, isJson, ready]);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => {
            const value = editor.getValue();
            dispatch(updateTransformationTestThunk(type, value));
        });
        setReady(true);
    }, [dispatch, type]);

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
                }}
            />
        </div>
    );
}

// These variables are for testing and will be removed soon.
const initialArgsValue = {
    "initialValue": {"name": "value"},
};

const initialWorldStateValue = {};

const expectedPostWorldStateValue = {
    "book": {"name": "value"},
    "book_name": "value",
};

export const InitialArgsEditor = (props) => (
    <ScriptingEditor type="initialArgs" {...props} initial={initialArgsValue} />
);
export const InitialWorldStateEditor = (props) => (
    <ScriptingEditor type="initialWorldState" {...props} initial={initialWorldStateValue} />
);

export const ExpectedPostWorldStateEditor = (props) => (
    // eslint-disable-next-line max-len
    <ScriptingEditor type="expectedPostWorldState" {...props} initial={expectedPostWorldStateValue} />
);
export const TransformOutputEditor = (props) => (
    <ScriptingEditor type="transformOutput" {...props} />
);
