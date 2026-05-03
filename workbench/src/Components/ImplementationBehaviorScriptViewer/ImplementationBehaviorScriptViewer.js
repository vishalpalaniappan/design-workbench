import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import "./ImplementationBehaviorScriptViewer.scss";

ImplementationBehaviorScriptViewer.propTypes = {
};

/**
 * Implementation behavior script viewer.
 * @return {JSX.Element}
 */
export function ImplementationBehaviorScriptViewer ({}) {
    const dispatch = useDispatch();
    const [ready, setReady] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        if (ready) {
            editorRef.current.setValue("asdf");
        }
    }, [ready]);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => {
        });
        setReady(true);
    }, []);

    return (
        <div style={{width: "100%", height: "100%"}}>
            <Editor
                defaultLanguage={"plaintext"}
                defaultValue="asdf"
                theme="vs-dark"
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
