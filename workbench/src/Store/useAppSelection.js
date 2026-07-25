import {useMemo} from "react";

import {useSelector} from "react-redux";

import {useDalEngine} from "../Providers/GlobalProviders";
import {
    selectActiveTab,
    selectAppMode,
    selectCounter,
    selectDesignLoaded,
    selectHasEntryPoint,
    selectLastSaved,
    selectSelectedBehaviorId,
    selectSelectedGraphId,
    selectSelectedInvariantId,
    selectSelectedMappingId,
    selectSelectedParticipantId,
    selectSelectedTraceId, 
    selectStatusMsg} from "./appSelectors";

/**
 * Returns the selected graph from the engine.
 * @return {Object}
 */
export const useSelectedGraph = () => {
    const {engine} = useDalEngine();
    const selectedGraphId = useSelector(selectSelectedGraphId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!selectedGraphId) return null;
        engine.selectGraph(selectedGraphId);
        return engine.graph;
    }, [engine, selectedGraphId, counter]);
};

/**
 * Returns the selected behavior from the engine.
 * @return {Object}
 */
export const useSelectedBehavior = () => {
    const {engine} = useDalEngine();
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!selectedBehaviorId) return null;
        return engine.getNode(selectedBehaviorId).getBehavior();
    }, [engine, selectedBehaviorId, counter]);
};

/**
 * Returns the selected participant from the engine (given a behavior).
 * @return {Object}
 */
export const useSelectedParticipant = () => {
    const {engine} = useDalEngine();
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);
    const selectedParticipantId = useSelector(selectSelectedParticipantId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!selectedBehaviorId || !selectedParticipantId) return null;
        const behavior = engine.getNode(selectedBehaviorId).getBehavior();
        return behavior.getParticipant(selectedParticipantId);
    }, [engine, selectedBehaviorId, selectedParticipantId, counter]);
};

/**
 * Returns the selected invariant from engine (given a behavior and participant)
 * @return {Object}
 */
export const useSelectedInvariant = () => {
    const {engine} = useDalEngine();
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);
    const selectedParticipantId = useSelector(selectSelectedParticipantId);
    const selectedInvariantId = useSelector(selectSelectedInvariantId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!selectedBehaviorId || !selectedParticipantId || !selectedInvariantId) return null;
        const behavior = engine.getNode(selectedBehaviorId).getBehavior();
        const participant = behavior.getParticipant(selectedParticipantId);
        return participant.getInvariant(selectedInvariantId);
    }, [engine, selectedBehaviorId, selectedParticipantId, selectedInvariantId, counter]);
};

/**
 * Returns a list of graphs from the engine.
 * @return {Object}
 */
export const useGraphs = () => {
    const {engine} = useDalEngine();
    const graphId = useSelector(selectSelectedGraphId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        return engine.graphs.getGraphNames();
    }, [engine, graphId, counter]);
};

/**
 * Returns a list of participants from the selected behavior.
 * @return {Object}
 */
export const useParticipants = () => {
    const {engine} = useDalEngine();
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!selectedBehaviorId) return [];
        const behavior = engine.getNode(selectedBehaviorId).getBehavior();
        return behavior.getParticipants();
    }, [engine, selectedBehaviorId, counter]);
};

/**
 * Returns a list of participants from the selected behavior.
 * @return {Object}
 */
export const useAst = () => {
    const {engine} = useDalEngine();
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        const files = engine.implementation.getFiles();
        const entryPoint = engine.implementation.getEntryPoint();

        for (const file of files) {
            if (file._name === entryPoint) {
                return file.getAst();
            }
        }
    }, [engine, counter]);
};

/**
 * Returns a list of invariants from the selected participant.
 * @return {Object} The list of invariants
 */
export const useInvariants = () => {
    const {engine} = useDalEngine();
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);
    const selectedParticipantId = useSelector(selectSelectedParticipantId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!selectedBehaviorId || !selectedParticipantId) return [];
        const behavior = engine.getNode(selectedBehaviorId).getBehavior();
        const participant = behavior.getParticipant(selectedParticipantId);
        return participant ? participant.getInvariants() : [];
    }, [engine, selectedBehaviorId, selectedParticipantId, counter]);
};

/**
 * Returns the selected abstraction id from the engine.
 * @return {Object} The selected mapping
 */
export const useSelectedMapping = () => {
    const {engine} = useDalEngine();
    const selectedMapping = useSelector(selectSelectedMappingId);
    const counter = useSelector(selectCounter);
    return useMemo(() => {
        if (!selectedMapping) return null;
        return selectedMapping;
    }, [engine, selectedMapping, counter]);
};


/**
 * Returns the selected behavior abstractions from the engine.
 * @return {Object} The selected behavior abstractions
 */
export const useSelectedBehaviorAbstractions = () => {
    const {engine} = useDalEngine();
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);

    // Get statements with chosen behavior from implementation.
    const stmts = engine.implementation.getStatementsWithBehavior(selectedBehaviorId);
    const abstractions = [];
    for (const stmt of stmts) {
        const file = engine.implementation.getFileContainingStmtWithUid(stmt._uid);
        abstractions.push({
            type: "behavior",
            uid: stmt._uid,
            fileUid: file.getUid(),
            lineNumber: stmt._start_line,
            source: stmt._source,
        });

        for (const participant of stmt.getParticipants()) {
            abstractions.push({
                type: "participant",
                uid: stmt._uid,
                fileUid: file.getUid(),
                lineNumber: stmt._start_line,
                participantName: participant.participantName,
                variableName: participant.variableName,
            });
        }
    }

    return abstractions;
};

/**
 * Returns a list of invariant types from the engine.
 * @return {Object}
 */
export const useInvariantTypes = () => {
    const {engine} = useDalEngine();

    return useMemo(() => {
        if (!engine) return [];
        return engine.invariant_types;
    }, [engine]);
};

/**
 * Returns the current status message.
 * @return {Object}
 */
export const useStatusMsg = () => {
    const statusMsg = useSelector(selectStatusMsg);

    return useMemo(() => {
        return statusMsg;
    }, [statusMsg]);
};

/**
 * Returns the last saved date time.
 * @return {Date} Last saved date
 */
export const useLastSaved = () => {
    const lastSaved = useSelector(selectLastSaved);

    return useMemo(() => {
        return lastSaved;
    }, [lastSaved]);
};

/**
 * Returns the app mode.
 * @return {Number} 1 for design mode, 2 for mapping mode
 */
export const useAppMode = () => {
    const appMode = useSelector(selectAppMode);

    return useMemo(() => {
        return appMode;
    }, [appMode]);
};


/**
 * Returns the currently active tab.
 * @return {Object}
 */
export const useActiveTab = () => {
    const activeTab = useSelector(selectActiveTab);

    return useMemo(() => {
        return activeTab;
    }, [activeTab]);
};

/**
 * Returns a list of engine files.
 * @return {Object}
 */
export const useEngineFiles = () => {
    const {engine} = useDalEngine();
    const counter = useSelector(selectCounter);
    const selectedBehaviorId = useSelector(selectSelectedBehaviorId);
    const activeTab = useSelector(selectActiveTab);

    return useMemo(() => {
        if (!engine) return null;
        return engine.getFiles().map((file) => {
            // Convert map into format accepted by UI.
            const index = file.getStatementIndex().map((entry) => {
                return {
                    uid: entry._uid,
                    start_line: entry._start_line,
                    end_line: entry._end_line,
                    source: entry._source,
                    behaviorId: entry._behaviorId,
                };
            });
            // Return file info in format accepted by UI.
            return {
                name: file._name,
                path: file.getKey(),
                content: file.getContent(),
                updatedContent: file.getUpdatedContent(),
                type: "file",
                uid: file._uid,
                mapping: index,
            };
        });
    }, [engine, selectedBehaviorId, activeTab, counter]);
};

/**
 * Returns whether a design is loaded.
 * @return {Boolean}
 */
export const useDesignLoaded = () => {
    const designLoaded = useSelector(selectDesignLoaded);

    return useMemo(() => {
        return designLoaded;
    }, [designLoaded]);
};


/**
 * Returns whether the design has an entry point.
 * @return {Boolean}
 */
export const useHasEntryPoint = () => {
    const hasEntryPoint = useSelector(selectHasEntryPoint);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        return hasEntryPoint;
    }, [hasEntryPoint, counter]);
};


/**
 * Returns the traces from the engine.
 * @return {Object} The traces from the engine
 */
export const useTraces = () => {
    const {engine} = useDalEngine();
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        return {...engine.traces?.getTraces()};
    }, [engine, counter]);
};


/**
 * Returns the selected trace ID.
 * @return {String} The selected trace ID
 */
export const useSelectedTraceId = () => {
    const selectedTraceId = useSelector(selectSelectedTraceId);
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        return selectedTraceId;
    }, [selectedTraceId, counter]);
};


export const useBehaviors = () => {
    const {engine} = useDalEngine();
    const counter = useSelector(selectCounter);

    return useMemo(() => {
        if (!engine) return [];
        return engine.graphs.getAllBehaviors();
    }, [engine, counter]);
};
