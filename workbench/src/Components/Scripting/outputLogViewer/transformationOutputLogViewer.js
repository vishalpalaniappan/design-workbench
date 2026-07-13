import React, {useCallback, useEffect, useRef, useState} from "react";

import Editor from "@monaco-editor/react";

import {useTransformOutputLog} from "../../../Store/scriptingSlice/useScriptingSelection";
import {useSelectedBehavior} from "../../../Store/useAppSelection";

TransformationOutputLogViewer.propTypes = {};

/**
 * Transformation output log viewer.
 * @return {JSX.Element}
 */
export function TransformationOutputLogViewer ({ }) {
    const transformOutputLog = useTransformOutputLog();
    const editorRef = useRef(null);
    const selectedBehavior = useSelectedBehavior();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (ready) {
            if (transformOutputLog && selectedBehavior) {
                const logstr = transformOutputLog
                    .map((entry) => {
                        const timestamp = new Date(entry.timestamp).toISOString();
                        return `[${timestamp}] ${entry.message}`;
                    })
                    .join("\n");
                editorRef.current.setValue(logstr);
            } else {
                editorRef.current.setValue("");
            }
        }
    }, [transformOutputLog, selectedBehavior, ready]);

    const handleEditorMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => { });
        setReady(true);

        monaco.languages.register({id: "logLang"});
        monaco.languages.setMonarchTokensProvider("logLang", {
            tokenizer: {
                root: [
                    [/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/, "timestamp"],
                    [/\b(INFO|DEBUG|WARN|ERROR|TRACE)\b/, "logLevel"],
                    [/\"([^"]+)\"\s*:/, "key"],
                    [/\"([^"]*)\"/, "string"],
                    [/\b\d+\b/, "number"],
                    [/[{}[\]]/, "delimiter"],
                    [/.+/, "text"],
                ],
            },
        });
        monaco.editor.setModelLanguage(editor.getModel(), "logLang");
        /**
         * TODO: I am setting the theme in the primitives editor and since only
         * one theme can be applied per loaded monaco runtime, I am setting it
         * there. I should probably create a central place where I define the
         * themes so I can track this but I will return to this later.
         */
    }, [transformOutputLog]);

    return (
        <div style={{width: "100%", height: "100%"}}>
            <Editor
                defaultValue=""
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
