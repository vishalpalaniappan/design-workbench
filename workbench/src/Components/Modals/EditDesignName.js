import React, {useCallback, useEffect, useRef, useState} from "react";

import PropTypes from "prop-types";
import {useDispatch} from "react-redux";

import {useDalEngine} from "../../Providers/GlobalProviders";

import "./AddValue.scss";

EditDesignName.propTypes = {
    close: PropTypes.func.isRequired,
    args: PropTypes.object,
};

/**
 * Edit Design Name modal body component.
 * @return {JSX.Element}
 */
export function EditDesignName ({close, args}) {
    const dispatch = useDispatch();
    const {engine} = useDalEngine();

    const [designName, setDesignName] = useState("");
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
            setDesignName(engine._name);
        }
    }, [engine, args]);

    const handleSubmit = useCallback(() => {
        try {
            const normalizedDesignName = designName.trim();
            if (engine) {
                engine.setName(normalizedDesignName);
                engine.save();
            }
            close();
        } catch (err) {
            setError(err.toString());
        }
    }, [dispatch, designName, close, engine]);

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
                <span>Design Name:</span>
            </div>
            <div className="value-name-input">
                <input ref={inputRef}
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}></input>
            </div>
            <div className="invariant-name-submit">
                <button type="button" onClick={handleSubmit}>Update Design Name</button>
            </div>
            {error && (
                <div style={{float: "right"}} className="value-error">
                    {error}
                </div>
            )}
        </div>
    );
}
