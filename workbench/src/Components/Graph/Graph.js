import React, {useCallback, useEffect, useRef} from "react";

import {BehavioralGraphBuilder} from "sample-ui-component-library";

import "./Graph.scss";

Graph.propTypes = {
};

/**
 * Graph component
 * @return {JSX.Element}
 */
export function Graph () {
    const editorRef = useRef();

    const connectBehaviors = useCallback(
        (from, to) => {
        },
        [editorRef]
    );

    const deleteBehavior = useCallback(
        (node) => {
        },
        [editorRef]
    );

    const deleteTransition = useCallback(
        (edge) => {
        },
        [editorRef]
    );

    const selectBehavior = useCallback(
        (nodeId) => {
        },
        []
    );


    return (
        <div className="graph-container">
            <BehavioralGraphBuilder
                ref={editorRef}
                connectBehaviors={connectBehaviors}
                deleteTransition={deleteTransition}
                deleteBehavior={deleteBehavior}
                selectBehavior={selectBehavior}
            />
        </div>
    );
}
