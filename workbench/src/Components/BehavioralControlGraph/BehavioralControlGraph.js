import React, {useCallback, useEffect, useRef} from "react";

import {useDispatch} from "react-redux";
import {BehavioralGraphBuilder} from "sample-ui-component-library";

import {useDalEngine} from "../../Providers/GlobalProviders";
import {setSelectedBehavior} from "../../Store/appSlice";
import {selectBehaviorThunk} from "../../Store/appThunk";
import {deleteBehaviorThunk} from "../../Store/appThunk";
import {useSelectedGraph} from "../../Store/useAppSelection";
import {useSelectedBehavior} from "../../Store/useAppSelection";

import "./BehavioralControlGraph.scss";

/**
 * Behavioral Control Graph Creator
 * @return {JSX.Element}
 */
export function BehavioralControlGraph () {
    const {engine} = useDalEngine();

    /**
     * TODO:
     * Since the design is now an executable semantic model, it makes sense
     * to include the control flow in the behavioral control graph, it serves
     * a larger role than just richer semantic information. It will allow the
     * behavior of the design as a whole to be simulated independant of the
     * implementation.
     */

    const dispatch = useDispatch();
    const selectedGraph = useSelectedGraph();
    const selectedBehavior = useSelectedBehavior();

    const graphRef = useRef(null);

    useEffect(() => {
        if (engine) {
            graphRef.current.updateEngine(engine);
        }
    }, [selectedGraph, selectedBehavior, engine]);

    const connectBehaviors = useCallback((from, to) => {
        if (!to) return;
        try {
            engine.getNode(from.id).addGoToBehavior(to.id);
            graphRef.current.updateEngine(engine);
        } catch (TransitionAlreadyExistsError) {
            console.error(`The transition from ${from.id} to ${to.id} already exists.`);
        }
    }, [graphRef, engine]);

    const deleteBehavior = useCallback((node) => {
        dispatch(deleteBehaviorThunk(node.id));
        graphRef.current.updateEngine(engine);
    }, [engine, graphRef, dispatch]);

    const deleteTransition = useCallback((edge) => {
        const fromNode = engine.getNode(edge.from);
        fromNode.removeGoToBehavior(edge.to);
        graphRef.current.updateEngine(engine);
        dispatch(setSelectedBehavior(null));
    }, [engine, graphRef, dispatch]);

    const selectBehavior = useCallback((id) => {
        try {
            dispatch(selectBehaviorThunk(id));
        } catch (err) {
            console.error(err);
        }
    }, [dispatch]);

    return (
        <div className="flow-wrapper">
            <BehavioralGraphBuilder
                ref={graphRef}
                connectBehaviors={connectBehaviors}
                deleteBehavior={deleteBehavior}
                deleteTransition={deleteTransition}
                selectBehavior={selectBehavior} />
        </div>
    );
}
