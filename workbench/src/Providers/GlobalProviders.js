import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {pack, unpack} from "msgpackr";
import PropTypes, {object} from "prop-types";
import {useDispatch} from "react-redux";
import useWebSocket, {ReadyState} from "react-use-websocket";

import {incrementCounter, setActiveTab, setLastSaved} from "../Store/appSlice";
import {setStatusMsg} from "../Store/appSlice";
import {setDesignLoaded} from "../Store/appSlice";
import {addTraceThunk} from "../Store/appThunk";
import {useActiveTab} from "../Store/useAppSelection";
import engine from "./DalEngine";
import DalEngineContext from "./DalEngineContext";
import ServerContext from "./ServerContext";
import TerminalContext from "./TerminalContext";
import workbench from "./WorkbenchApp";
import WorkspaceContext from "./WorkspaceContext";
import WorkbenchContext from "./WorkbenchContext";


GlobalProviders.propTypes = {
    children: PropTypes.node,
};

/**
 * Provides all contexts consumed by the application.
 * @param {JSX} children
 * @return {JSX}
 */
function GlobalProviders ({children}) {
    const [workspace, setWorkspace] = useState();
    const [design, setDesign] = useState();
    const termWriteRef = useRef(null);

    const dispatch = useDispatch();

    // Connect to websocket and setup auto reconnect
    const socketUrl = "ws://localhost:3002";
    const {sendMessage: rawSendMessage, lastMessage, readyState} = useWebSocket(socketUrl, {
        onOpen: () => rawSendMessage(pack({"type": "workspaces"})),
        shouldReconnect: (closeEvent) => true,
        onClose: (e) => console.log("Websocket closed, attempting to reconnect...", e),
    });

    useEffect(() => {
        if (lastMessage !== null) {
            processMessage(lastMessage);
        }
    }, [lastMessage, processMessage]);


    const sendMessage = useCallback((message) => {
        if (readyState === ReadyState.OPEN) {
            const packedMessage = pack(message);
            rawSendMessage(packedMessage);
        } else {
            console.error("WebSocket is not open. Ready state:", readyState);
        }
    }, [readyState, rawSendMessage]);

    // Process the received message
    const processMessage = useCallback(async (lastMessage) => {
        const arrayBuffer = await lastMessage.data.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const msg = unpack(bytes);
        switch (msg.type) {
            case "workspaces":
                setWorkspace(msg.data);
                break;
            case "load_design":
                setDesign(msg.data);
                dispatch(incrementCounter());
                break;
            case "terminal_output":
                termWriteRef.current?.(msg.data);
                break;
            case "design_save_successful":
                loadSavedDesign(msg.data.files);
                dispatch(setLastSaved(new Date().toISOString()));
                dispatch(setStatusMsg("Design saved successfully!"));
                break;
            case "design_save_failed":
                dispatch(setStatusMsg("Failed to save design."));
                break;
            case "add_trace":
                dispatch(addTraceThunk(msg.data));
                dispatch(setStatusMsg("Received trace from server."));
                /**
                 * I am saving this version of the engine to the server
                 * every time that I add a new trace to it. You can ask
                 * why don't you just save the engine directly on the server
                 * because you can add the trace to it there and that might
                 * be valid but it creates two sources of truth and I don't
                 * want that. Instead, I only save the engine from the client
                 * side and the execution and trace generation pipeline is just
                 * meant to get the data to the front end and its up to the
                 * front end to save it. I am automatically saving it here.
                 * I will optimize all of this in the future but this is a
                 * process that will not cause any corruption in the data and
                 * even though it is convoluted, I will keep it as a reliable
                 * workflow while I establish the rest of the functionality.
                 */
                engine.save();
                break;
            case "synthesize_design":
                addSynthesizedDesign(msg.data);
                break;
            case "save_file":
                fileSaved(msg.data);
                dispatch(setLastSaved(new Date().toISOString()));
                break;
            case "error":
                console.error("Error message from server:", msg.data);
                break;
            default:
                break;
        }
    }, [dispatch, engine]);

    // Set the connection state
    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting",
        [ReadyState.OPEN]: "Connected",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated",
    }[readyState];

    // Used to allow msg handler to write to terminal.
    const setTermWriter = (fn) => {
        termWriteRef.current = fn;
    };

    // Indicates that the file is saved.
    const fileSaved = useCallback((uid) => {
        const file = workbench.fileSaved(uid);
        dispatch(incrementCounter());
        dispatch(setStatusMsg(`Saved ${file.name}.`));
    }, [workbench]);

    /**
     * Add the synthesized source to the design.
     * @param {String} source Synthesized Source
     */
    const addSynthesizedDesign = useCallback((source) => {
        const files = engine.getFiles();

        const fileData = JSON.parse(new TextDecoder().decode(source));

        // Either update existing file or save new files contents.
        // Set synthesized.py to active tab.
        for (const [name, value] of Object.entries(fileData)) {
            let file = files.find((engineFile) => engineFile.getName() === name);
            if (file) {
                file.setUpdatedContent(value);
            } else {
                file = engine.addFile(name, name, value);
            }
            if (name === "synthesized.py") {
                dispatch(setActiveTab(file._uid));
            }
        }
        dispatch(incrementCounter());
        engine.save();
    }, [engine, dispatch]);


    // When the workspace is first loaded, find the engine and deserialize it.
    useEffect(() => {
        if (!design) return;
        console.log(design);
        workbench.setName(design.designName);
        workbench.addFiles(design.files);
        document.title = design.designName + " - Design Workbench";

        const params = new URLSearchParams(window.location.search);
        params.set("design", design.designName);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        dispatch(setDesignLoaded(true));
        dispatch(incrementCounter());
    }, [design, engine]);

    return (
        // eslint-disable-next-line max-len
        <ServerContext.Provider value={{sendMessage, connectionStatus}}>
            <DalEngineContext.Provider value={{engine}}>
                <WorkbenchContext.Provider value={{workbench}}>
                    <WorkspaceContext.Provider value={{workspace, design}}>
                        <TerminalContext.Provider value={{setTermWriter}}>
                            {children}
                        </TerminalContext.Provider>
                    </WorkspaceContext.Provider>
                </WorkbenchContext.Provider>
            </DalEngineContext.Provider>
        </ServerContext.Provider>
    );
};

export const useDalEngine = function () {
    const context = useContext(DalEngineContext);
    if (!context) {
        throw new Error("useDalEngine must be used within a GlobalProvider");
    }
    return context;
};

export const useWorkspace = function () {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error("useWorkspace must be used within a GlobalProvider");
    }
    return context;
};

export const useWorkbench = function () {
    const context = useContext(WorkbenchContext);
    if (!context) {
        throw new Error("useWorkbench must be used within a GlobalProvider");
    }
    return context;
};

export const useServer = function () {
    const context = useContext(ServerContext);
    if (!context) {
        throw new Error("useServer must be used within a GlobalProvider");
    }
    return context;
};

export default GlobalProviders;
