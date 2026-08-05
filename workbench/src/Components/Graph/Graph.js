import React, {useCallback, useEffect, useRef, useState} from "react";

import {DALEngine} from "dal-engine-core-js-lib-dev";
import {BehavioralGraphBuilder} from "sample-ui-component-library";

import {useWorkbenchRedux} from "../../Store/useAppSelection";
import {DesignValidator} from "./DesignValidator/DesignValidator";

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
        if (workbench && workbench.workbench.getAst()) {
            const engine = new DALEngine({name: "testEngine", description: ""});
            setEngine(engine);
            const ast = workbench.workbench.getAst();
            const behaviors = new DesignValidator(ast).run();
            for (const behavior of behaviors) {
                engine.addNode(behavior["name"], "", behavior["nextBehaviors"]);
            }
            editorRef.current.updateEngine(engine);
        }
    }, [workbench]);

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
