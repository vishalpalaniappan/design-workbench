import React, {useCallback, useEffect, useRef, useState} from "react";

import {DALEngine} from "dal-engine-core-js-lib-dev";
import {BehavioralGraphBuilder} from "sample-ui-component-library";

import { useWorkbenchRedux } from "../../Store/useAppSelection";

import "./Graph.scss";

Graph.propTypes = {
};

/**
 * Graph component
 * @return {JSX.Element}
 */
export function Graph () {
    const editorRef = useRef();

    const [engine, setEngine] = useState();
    const workbench = useWorkbenchRedux();

    useEffect(() => {
        console.log("Workbench Updated:", workbench.workbench.getAst());
    }, [workbench]);

    useEffect(() => {
        if (editorRef.current) {
            const engine = new DALEngine({name: "testEngine", description: ""});
            setEngine(engine);
            editorRef.current.updateEngine(engine);
            const timerId = setTimeout(() => {
                engine.addNode("testBehavior", []);
                engine.addNode("testBehavior2", []);
                editorRef.current.updateEngine(engine);
            }, 1000);
            return () => clearTimeout(timerId);
        }
    }, []);

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
