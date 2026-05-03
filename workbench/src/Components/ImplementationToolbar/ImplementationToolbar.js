/* eslint-disable max-len */
import React, {useCallback} from "react";

import PropTypes from "prop-types";
import {Floppy, Play} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";

import {useDalEngine} from "../../Providers/GlobalProviders";
import {useServer} from "../../Providers/GlobalProviders";
import {setStatusMsg} from "../../Store/appSlice";
import {useHasEntryPoint} from "../../Store/useAppSelection";

import "./ImplementationToolbar.scss";

ImplementationToolbar.propTypes = {
};

/**
 * Implementation Tool Bar component.
 * @return {JSX.Element}
 */
export function ImplementationToolbar () {
    const dispatch = useDispatch();
    const {engine} = useDalEngine();
    const {sendMessage} = useServer();
    const hasEntryPoint = useHasEntryPoint();

    const saveDesign = useCallback(() => {
        if (engine) {
            engine.save();
            dispatch(setStatusMsg("Saving design..."));
        }
    }, [engine, dispatch]);

    const runDesign = useCallback(() => {
        if (sendMessage && engine) {
            if (hasEntryPoint) {
                sendMessage({
                    type: "terminal_run_entry_point",
                    data: engine.implementation.getEntryPoint(),
                });
            } else {
                const failureMsg = "Failed to run design. Please ensure an entry point is set.";
                sendMessage({
                    type: "terminal_run_entry_point",
                    data: `echo "${failureMsg}"`,
                });
            }
        }
    }, [sendMessage, hasEntryPoint, engine]);

    return (
        <div className="mainToolBar">
            <div className="mainToolBarLeft">
                <div className="mainToolBarGroup"></div>
                <div className="mainToolBarGroup"></div>
            </div>
            <div className="mainToolBarRight">
                <span className="mainToolBarButton" onClick={runDesign}>
                    <Play
                        size={20}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="mainToolBarButton">Run Implementation</span>
                </span>

                <span className="mainToolBarButton" onClick={saveDesign}>
                    <Floppy
                        size={14}
                        style={{"color": "white", "cursor": "pointer"}}/>
                    <span className="mainToolBarButton">Save Design</span>
                </span>
            </div>
        </div>
    );
}
