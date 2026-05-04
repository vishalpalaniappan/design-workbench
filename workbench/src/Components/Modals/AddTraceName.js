import React, {useCallback, useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {useDalEngine} from "../../Providers/GlobalProviders";

import "./AddValue.scss";

AddTraceName.propTypes = {
    close: PropTypes.func.isRequired,
    args: PropTypes.object,
};

/**
 * Add Trace Name modal body component.
 * @return {JSX.Element}
 */
export function AddTraceName ({close, args}) {
    const dispatch = useDispatch();
    const {engine} = useDalEngine();

    const [traceName, setTraceName] = useState("");
    const [error, setError] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (args) {
            console.log(args);
        }
    }, [args]);

    useEffect(() => {
        if (engine) {
            const traces = engine.traces;
            const trace = traces.getTrace(args.trace);
            if (trace?.name) {
                setTraceName(trace.name);
            }
        }
    }, [engine, args]);

    const handleSubmit = useCallback(() => {
        try {
            const normalizedTraceName = traceName.trim();
            if (engine) {
                const traces = engine.traces;
                const trace = traces.getTrace(args.trace);
                if (trace) {
                    trace.name = normalizedTraceName;
                }
            }
            close();
        } catch (err) {
            setError(err.toString());
        }
    }, [dispatch, traceName, close, engine]);

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
                <span>Trace Name:</span>
            </div>
            <div className="value-name-input">
                <input ref={inputRef}
                    value={traceName}
                    onChange={(e) => setTraceName(e.target.value)}></input>
            </div>
            <div className="invariant-name-submit">
                <button type="button" onClick={handleSubmit}>Add Trace Name</button>
            </div>
            {error && (
                <div style={{float: "right"}} className="value-error">
                    {error}
                </div>
            )}
        </div>
    );
}
