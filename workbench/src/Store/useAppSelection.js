import {useMemo} from "react";

import {useSelector} from "react-redux";

import {useDalEngine} from "../Providers/GlobalProviders";
import {useWorkbench} from "../Providers/GlobalProviders";
import {
    selectActiveTab,
    selectAppMode,
    selectCounter,
    selectDesignLoaded,
    selectHasEntryPoint,
    selectLastSaved,
    selectSelectedBehavior,
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
    const {workbench} = useWorkbench();
    const counter = useSelector(selectCounter);
    const activeTab = useSelector(selectActiveTab);

    return useMemo(() => {
        if (!workbench) return null;
        return workbench.files;
    }, [workbench, activeTab, counter]);
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

/**
 * Returns the selected trace ID.
 * @return {String} The selected trace ID
 */
export const useWorkbenchRedux = () => {
    const counter = useSelector(selectCounter);
    const workbench = useWorkbench();

    return useMemo(() => {
        return workbench;
    }, [counter, workbench]);
};


/**
 * Returns the selected trace ID.
 * @return {String} The selected trace ID
 */
export const useSelectedBehavior = () => {
    const selectedBehavior = useSelector(selectSelectedBehavior);

    return useMemo(() => {
        return selectedBehavior;
    }, [selectedBehavior]);
};
