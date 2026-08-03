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
    const engineRef = useRef(null);
    const activeTab = useActiveTab();

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


    /**
     * Leaving this note here regarding the loadSavedDesign method below:
     * - First, the statement index can be removed because we are no longer
     * using it to do visual mapping.
     * - Second, I am updating the content of the text file to reflect what
     * the server sent back (the saved version). This then tells the editor
     * that the file is saved and it can update the UI accordingly. Its a nice
     * idea and it makes sure that the editor is always in sync with the server.
     * However, then why don't I update the rest of the content in the same way?
     * I modify behaviors as well and other content as well.
     *
     * So I think that what I will do is, when the server tells me that the
     * design is saved, I will trust it and update the all the editors to
     * indicate that the updated content is the saved content. This might be
     * less accurate, but I will revisit this later as it doesn't affect the
     * core functionality.
     */
    // When a design is saved, the server sends back the updated content
    // and mapping of the saved files in the design, this function saves
    // those changes to the engine instance.
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

        /**
         * Also, just wanted to note that there is no reason for
         * the trace data to be stored in the same file as the
         * design. They can be part of the same package but accessed
         * independently (the traces will be fully compressed).
         *
         * I am currently storing them together because it is easier for
         * my current workflow but in the future, the design and trace
         * being managed separately will be a better idea because it
         * will optimize these processes (will think more about this later).
         */

        // Sending design in chunks because there is a frame size
        // limit. This limit doesn't happen on the server side
        // but either way, I am not thinking too much about this, I am
        // more concerned with getting a reliable workflow that I can
        // use to test the features (this can be optimized later).
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
        console.log(design);
        workbench.setName(design.designName);
        workbench.addFiles(design.files);
        // engine.deserialize(new Uint8Array(design.data));
        // const files = engine.getFiles();
        // if (files.length > 0 && !activeTab) {
        //     dispatch(setActiveTab(files[0].uid));
        // }
        // console.log(engine);

        // document.title = design.fileName.split(".")[0] + " - Design Workbench";

        // const params = new URLSearchParams(window.location.search);
        // params.set("design", design.fileName);
        // const newUrl = `${window.location.pathname}?${params.toString()}`;
        // window.history.pushState({}, "", newUrl);

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
