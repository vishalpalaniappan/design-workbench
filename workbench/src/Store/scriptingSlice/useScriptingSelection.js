import {useMemo} from "react";

import {useSelector} from "react-redux";

import {useDalEngine} from "../../Providers/GlobalProviders";
import {useSelectedBehavior} from "../useAppSelection";
import {selectTransformOutput, selectTransformOutputLog} from "./scriptingSelectors";
import {selectScriptingCounter} from "./scriptingSelectors";


export const useTransformOutput = () => {
    const transformOutput = useSelector(selectTransformOutput);
    const counter = useSelector(selectScriptingCounter);
    return useMemo(() => {
        return transformOutput?.output;
    }, [transformOutput, counter]);
};

export const useTransformOutputLog = () => {
    const transformOutputLog = useSelector(selectTransformOutputLog);
    const counter = useSelector(selectScriptingCounter);
    return useMemo(() => {
        return transformOutputLog;
    }, [transformOutputLog, counter]);
};

export const useScriptingBehaviors = () => {
    const {engine} = useDalEngine();

    return useMemo(() => {
        const behaviors = engine.graphs.getAllBehaviors();
        return {behaviors};
    }, [engine]);
};

export const useSelectedTransformationTest = () => {
    const selectedBehavior = useSelectedBehavior();
    const counter = useSelector(selectScriptingCounter);
    return useMemo(() => {
        if (!selectedBehavior) return null;
        // For now there will only be one test per behavior, so here
        // if there is no test case, I will create an empty one and return it.
        if (selectedBehavior.getTransformationTests().length === 0) {
            selectedBehavior.addTransformationTest({
                initialArgs: null,
                initialWorldState: null,
                expectedPostWorldState: null,
            });
        }
        return selectedBehavior.getTransformationTests()[0];
    }, [selectedBehavior, counter]);
};
