// Selectors for debugging slice
import {useMemo} from "react";

import {useSelector} from "react-redux";

import {selectSelectedTraceEntryIndex} from "./debuggingSelectors";


export const useSelectedTraceEntryIndex = () => {
    const selectedTraceEntryIndex = useSelector(selectSelectedTraceEntryIndex);
    return useMemo(() => {
        return selectedTraceEntryIndex;
    }, [selectedTraceEntryIndex]);
};
