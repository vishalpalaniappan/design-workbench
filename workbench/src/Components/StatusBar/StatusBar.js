import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {CircleFill, Pencil} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";
import {useModalManager} from "ui-layout-manager-dev";

import {useDalEngine} from "../../Providers/GlobalProviders";
import ServerContext from "../../Providers/ServerContext";
import {setDesignMode} from "../../Store/appSlice";
import {setDebuggingMode} from "../../Store/appSlice";
import {useStatusMsg} from "../../Store/useAppSelection";
import {useAppMode} from "../../Store/useAppSelection";
import {EditDesignName} from "../Modals/EditDesignName";

import "./StatusBar.scss";

/**
 * Status bar of the viewer component.
 * @return {JSX.Element}
 */
export function StatusBar () {
    const {connectionStatus} = useContext(ServerContext);
    const timeoutRef = useRef(null);
    const appMode = useAppMode();
    const dispatch = useDispatch();
    const {engine} = useDalEngine();
    const {openModal} = useModalManager();

    const [connectionColor, setConnectionColor] = useState({color: "green"});
    const [message, setMessage] = useState("");
    const statusMsg = useStatusMsg();

    const STATUS_MSG_TIMEOUT = 3000;

    const connectionColorMap = {
        Connected: "green",
        Connecting: "yellow",
        Closed: "red",
        Closing: "red",
        Uninstantiated: "red",
    };

    useEffect(() => {
        setMessage(statusMsg);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setMessage("");
        }, STATUS_MSG_TIMEOUT);
    }, [statusMsg]);

    useEffect(() => {
        setConnectionColor({color: connectionColorMap[connectionStatus] || "red"});
    }, [connectionStatus]);

    const selectMode = (event) => {
        const value = parseInt(event.target.value);
        if (value === 1 && appMode !== 1) {
            dispatch(setDesignMode());
        } else if (value === 2) {
            dispatch(setDebuggingMode());
        }
    };

    const editDesignName = useCallback(() => {
        openModal({
            title: "Edit Design Name",
            args: {
                designName: engine?engine._name:"",
            },
            render: ({close, args}) => {
                return <EditDesignName close={close} args={args} />;
            },
        });
    }, [openModal, engine]);

    return (
        <div className="status-bar">
            <div className="status-left">
                <div className="status-message edit-name" onClick={editDesignName}>
                    <Pencil size={12} style={{paddingRight: "5px"}}/>
                    {engine?engine._name:""}
                </div>
                <div className="status-message">{message}</div>
            </div>
            <div className="status-right">
                <div className="status-bar-select">
                    <select value={appMode} onChange={
                        (event) => selectMode(event)
                    }>
                        <option value={1}>Design</option>
                        <option value={2}>Debugging</option>
                    </select>
                </div>
                <div className="status-connected">
                    <CircleFill
                        size={12}
                        className="connectionColor"
                        style={connectionColor} />{connectionStatus}
                </div>
            </div>
        </div>
    );
}
