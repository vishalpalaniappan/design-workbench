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
    selectSelectedTraceId, 
    selectStatusMsg} from "./appSelectors";


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
    const activeTab = useSelector(selectActiveTab);

    return useMemo(() => {
        if (!engine) return null;
        return [];
        // return engine.getFiles().map((file) => {
        //     // Convert map into format accepted by UI.
        //     const index = file.getStatementIndex().map((entry) => {
        //         return {
        //             uid: entry._uid,
        //             start_line: entry._start_line,
        //             end_line: entry._end_line,
        //             source: entry._source,
        //             behaviorId: entry._behaviorId,
        //         };
        //     });
        //     // Return file info in format accepted by UI.
        //     return {
        //         name: file._name,
        //         path: file.getKey(),
        //         content: file.getContent(),
        //         updatedContent: file.getUpdatedContent(),
        //         type: "file",
        //         uid: file._uid,
        //         mapping: index,
        //     };
        // });
    }, [engine, activeTab, counter]);
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
