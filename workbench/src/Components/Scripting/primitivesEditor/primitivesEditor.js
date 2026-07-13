import React, { useCallback, useEffect, useRef, useState } from "react";

import Editor from "@monaco-editor/react";
import { useDispatch } from "react-redux";

import { updateScriptingPrimitiveThunk } from "../../../Store/scriptingSlice/scriptingThunk";
import { useSelectedBehavior } from "../../../Store/useAppSelection";

PrimitivesEditor.propTypes = {

};

/**
 * Primitives editor.
 *
 * TODO: Rename this to script editor, it contains transformation and validation
 * primitives and the proess has evolved since I created this.
 * @return {JSX.Element}
 */
export function PrimitivesEditor({ }) {
    const dispatch = useDispatch();
    const behavior = useSelectedBehavior();
    const editorRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            if (behavior && behavior._script) {
                const primitivesStr = behavior._script;
                editorRef.current.setValue(primitivesStr);
            } else {
                editorRef.current.setValue("");
            }
        }
    }, [isReady, behavior]);

    const handleEditorMount = useCallback((editor, monaco) => {
        monaco.languages.register({id: "behavioralLanguage"});
        monaco.languages.setMonarchTokensProvider("behavioralLanguage", {
            tokenizer: {
                root: [
                    [/^\s*#.*$/, "comment"], // line starting with #
                    [/\brequire\b/, "requireKeyword"],
                    [/\binvariant\b/, "invariantKeyword"],
                ],
            },
        });
        monaco.editor.defineTheme("behavioralLanguageTheme", {
            base: "vs-dark",
            inherit: true,
            rules: [
                {token: "comment", foreground: "6A9955"},// green
                {token: "requireKeyword", foreground: "569CD6"}, // blue
                {token: "invariantKeyword", foreground: "F44747"}, // red
                {token: "timestamp", foreground: "6A9FB5"},
                {token: "logLevel", foreground: "D16969", fontStyle: "bold"},
                {token: "key", foreground: "9CDCFE"},
                {token: "string", foreground: "CE9178"},
                {token: "number", foreground: "B5CEA8"},
                {token: "delimiter", foreground: "808080"},
                {token: "text", foreground: "AAB2BF"},
            ],
            colors: {
                "editor.foreground": "#d4d4d4",
                "editor.background": "#1e1e1e",
            },
        });
        monaco.editor.setModelLanguage(editor.getModel(), "behavioralLanguage");
        monaco.editor.setTheme("behavioralLanguageTheme");

        editorRef.current = editor;
        editor.onDidChangeModelContent((e) => {
            const value = editor.getValue();
            dispatch(updateScriptingPrimitiveThunk(value));
        });
        setIsReady(true);
    }, [behavior]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Editor
                defaultLanguage="json"
                defaultValue=""
                readOnly={true}
                onMount={handleEditorMount}
                options={{
                    minimap: { enabled: false },
                    lineNumbers: "off",
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
};
