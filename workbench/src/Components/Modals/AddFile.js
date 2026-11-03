import React, {useCallback, useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {useServer} from "../../Providers/GlobalProviders";

import "./AddValue.scss";

AddFile.propTypes = {
    close: PropTypes.func.isRequired,
};

/**
 * Add File modal body component.
 * @return {JSX.Element}
 */
export function AddFile ({close}) {
    const dispatch = useDispatch();

    const [fileName, setFileName] = useState("");
    const [error, setError] = useState(null);

    const {sendMessage} = useServer();

    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = useCallback(() => {
        if (fileName.trim() === "") {
            setError("File name must not be empty.");
            return;
        }
        try {
            sendMessage({
                type: "terminal_run_file_cmd",
                payload: {
                    cmd: `echo "" > ${fileName} \n`,
                },
            });
            close();
        } catch (err) {
            setError(err.toString());
        }
    }, [dispatch, fileName, close]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
            } else if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [close, handleSubmit]);

    return (
        <div className="add-value-modal">
            <div className="value-name-label">
                <span>File Path (relative to workspace):</span>
            </div>
            <div className="value-name-input">
                <input ref={inputRef}
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}></input>
            </div>
            <div className="invariant-name-submit">
                <button type="button" onClick={handleSubmit}>Add File</button>
            </div>
            {error && (
                <div style={{float: "right"}} className="value-error">
                    {error}
                </div>
            )}
        </div>
    );
}
