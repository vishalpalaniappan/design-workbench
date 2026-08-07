import React, {useCallback, useEffect, useRef, useState} from "react";

import ReactJsonView from "@microlink/react-json-view";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import {useDispatch} from "react-redux";
import {BehavioralGraphBuilder} from "sample-ui-component-library";

import {selectBehaviorThunk} from "../../Store/appThunk";
import {useWorkbenchRedux} from "../../Store/useAppSelection";
import {useSelectedBehavior} from "../../Store/useAppSelection";

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
    const dispatch = useDispatch();
    const workbench = useWorkbenchRedux();
    const [behaviors, setBehaviors] = useState();

    useEffect(() => {
        if (workbench && workbench.workbench.getAst()) {
            const engine = new DALEngine({name: "testEngine", description: ""});
            const behaviors = workbench.workbench.validator.behaviors;
            setBehaviors(behaviors);
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
            if (nodeId) {
                const behavior = behaviors.find((_behavior) => _behavior.name == nodeId);
                dispatch(selectBehaviorThunk({...behavior}));
            } else {
                dispatch(selectBehaviorThunk({}));
            }
        },
        [behaviors]
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

/**
 * Behavior Inspector
 * @return {JSX}
 */
export function BehaviorInspector () {
    const [localVariables, setLocalVariables] = useState({});
    const behavior = useSelectedBehavior();

    useEffect(() => {
        setLocalVariables(behavior);
    }, [behavior]);

    const variableStackTheme = {
        base00: "#1e1e1e",
        base01: "#ddd",
        base02: "#474747",
        base03: "#444",
        base04: "#717171",
        base05: "#444",
        base06: "#444",
        base07: "#c586c0", // keys
        base08: "#444",
        base09: "#ce9178", // String
        base0A: "rgba(70, 70, 230, 1)",
        base0B: "#ce9178",
        base0C: "rgba(70, 70, 230, 1)",
        base0D: "#bbb18c", // indent arrow
        base0E: "#bbb18c", // indent arrow
        base0F: "#a7ce8a",
    };

    const select = (selection) => {
        console.log(selection);
    }
    return (
        <div className="inspectorContainer w-100 h-100 ">
            <ReactJsonView
                src={localVariables}
                theme={variableStackTheme}
                collapsed={false}
                name={"local"}
                groupArraysAfterLength={100}
                sortKeys={true}
                displayDataTypes={false}
                quotesOnKeys={true}
                collapseStringsAfterLength={30}
                enableClipboard={false}
                onSelect={select}>
            </ReactJsonView>
        </div>
    );
}
