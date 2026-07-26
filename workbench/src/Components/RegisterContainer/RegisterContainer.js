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

    return (
        <div style={{width: "100%", height: "100%"}}>
            <Editor
                defaultLanguage={"plaintext"}
                defaultValue=""
                theme="vs-dark"
                onMount={handleEditorMount}
                options={{
                    minimap: {enabled: false},
                    lineNumbers: "off",
                    wordWrap: "on",
                    scrollBeyondLastLine: false
                }}
            />
        </div>
    );
}
