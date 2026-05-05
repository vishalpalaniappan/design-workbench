import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {pack, unpack} from "msgpackr";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";
import useWebSocket, {ReadyState} from "react-use-websocket";

import {incrementCounter, setActiveTab, setLastSaved} from "../Store/appSlice";
import {setStatusMsg} from "../Store/appSlice";
import {setDesignLoaded} from "../Store/appSlice";
import {addTraceThunk} from "../Store/appThunk";
import engine from "./DalEngine";
import DalEngineContext from "./DalEngineContext";
import ServerContext from "./ServerContext";
import TerminalContext from "./TerminalContext";
import WorkspaceContext from "./WorkspaceContext";


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
    const engineRef = useRef(null);

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
                engine.save();
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

    // When a design is saved, the server sends back the updated content
    // and mapping of the saved files in the design, this function saves
    // those changes to the engien instance.
    const loadSavedDesign = useCallback((files) => {
        if (!engineRef.current) return;
        files.forEach((file) => {
            const engineFile = engineRef.current.getFiles().find(
                (f) => f._name === file._name
            );
            if (engineFile) {
                engineFile.setContent(file._versions[0]._content);
                engineFile.setUpdatedContent(file._versions[0]._updatedContent);
                engineFile.setStatementIndex(file._versions[0]._statementIndex);
                dispatch(incrementCounter());
            }
        });
    }, [dispatch]);

    const chunkUint8Array = (uint8, chunkSize) => {
        const chunks = [];
        for (let i = 0; i < uint8.length; i += chunkSize) {
            chunks.push(uint8.subarray(i, i + chunkSize));
        }
        return chunks;
    };

    // Called to save the engine to the server.
    const saveEngine = useCallback(() => {
        if (!engineRef.current || !design) return;
        const serialized = engineRef.current.serialize();
        const CHUNK_SIZE = 32 * 1024;
        const chunks = chunkUint8Array(serialized, CHUNK_SIZE);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            sendMessage({
                type: "save_engine",
                payload: {
                    fileName: design.fileName,
                    data: chunk,
                    index: i,
                    total: chunks.length,
                },
            });
        }
    }, [sendMessage, design]);

    // When the workspace is first loaded, find the engine and deserialize it.
    useEffect(() => {
        if (!design) return;
        engine.deserialize(new Uint8Array(design.data));
        const files = engine.getFiles();
        if (files.length > 0) {
            dispatch(setActiveTab(files[0].uid));
        }
        console.log(engine);

        document.title = design.fileName.split(".")[0] + " - Design Workbench";

        const params = new URLSearchParams(window.location.search);
        params.set("design", design.fileName);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        dispatch(setDesignLoaded(true));
    }, [design, engine]);

    // Set the engine ref and save fn for use in msg handler and other contexts.
    useEffect(() => {
        engineRef.current = engine;
        engine.save = saveEngine;
    }, [engine, saveEngine]);

    return (
        // eslint-disable-next-line max-len
        <ServerContext.Provider value={{sendMessage, connectionStatus}}>
            <DalEngineContext.Provider value={{engine}}>
                <WorkspaceContext.Provider value={{workspace, design}}>
                    <TerminalContext.Provider value={{setTermWriter}}>
                        {children}
                    </TerminalContext.Provider>
                </WorkspaceContext.Provider>
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

export const useServer = function () {
    const context = useContext(ServerContext);
    if (!context) {
        throw new Error("useServer must be used within a GlobalProvider");
    }
    return context;
};

export default GlobalProviders;
