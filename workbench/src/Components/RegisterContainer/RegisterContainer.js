import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";

import "./RegisterContainer.scss";

RegisterContainer.propTypes = {
};

/**
 * Register Container
 * @return {JSX.Element}
 */
export function RegisterContainer ({}) {
    const editorRef = useRef(null);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => {});
    }, []);

    const handleEditorMount2 = useCallback((editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => {});
    }, []);

    return (
        <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
            <div style={{width: "100%", display: "flex", flexGrow: "1"}}>
                <Editor
                    defaultLanguage={"python"}
                    defaultValue=""
                    theme="vs-dark" 
                    onMount={handleEditorMount2}
                    options={{
                        minimap: {enabled: false},
                        lineNumbers: "off",
                        wordWrap: "on",
                        scrollBeyondLastLine: false
                    }}
                />
            </div>
        </div>
    );
}
