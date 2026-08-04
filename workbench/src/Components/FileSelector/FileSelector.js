import React, {useCallback, useEffect, useRef} from "react";

import {ArrowClockwise, Floppy, PlusSquare, TerminalPlus, Trash} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";
import {FileBrowser} from "sample-ui-component-library";
import {useModalManager} from "ui-layout-manager-dev";

import {useDalEngine} from "../../Providers/GlobalProviders";
import {useWorkbench} from "../../Providers/GlobalProviders";
import {useServer} from "../../Providers/GlobalProviders";
import {setActiveTab, setStatusMsg} from "../../Store/appSlice";
import {useActiveTab, useEngineFiles} from "../../Store/useAppSelection";
import {AddEntryPoint} from "../Modals/AddEntryPoint";
import {AddFile} from "../Modals/AddFile";

import "./FileSelector.scss";

FileSelector.propTypes = {
};

/**
 * Component to select files from the workspace.
 * @return {JSX.Element}
 */
export function FileSelector () {
    const {engine} = useDalEngine();
    const {openModal} = useModalManager();

    const files = useEngineFiles();
    const dispatch = useDispatch();
    const activeTab = useActiveTab();
    const fileBrowserRef = useRef();
    const {workbench} = useWorkbench();
    const {sendMessage} = useServer();

    useEffect(() => {
        if (files) {
            fileBrowserRef.current.addFileTree(files);
            if (activeTab) {
                // TODO: Update component API to use uid for selection.
                const file = workbench.getFileUsingUid(activeTab);
                fileBrowserRef.current.selectNode(file);
            }
        }
    }, [files, workbench]);

    const onSelectFile = useCallback((node) => {
        dispatch(setActiveTab(node.uid));
    }, []);

    const createFile = useCallback(() => {
        openModal({
            title: "Add File",
            render: ({close}) => {return <AddFile close={close} />;},
        });
    }, []);

    const deleteFile = useCallback(() => {
        if (activeTab) {
            try {
                const file = workbench.getFileUsingUid(activeTab);
                if (!file) {
                    throw new Error(`File with UID ${activeTab} not found`);
                }
                // Path is relative to workspace (which contains designs) but
                // I set the design repo as the working directory, so I have to
                // format the string in this way.
                const path = file.path.split("/").slice(1).join("/");
                sendMessage({
                    type: "terminal_run_file_cmd",
                    payload: {
                        cmd: `rm ${path} \n`,
                    },
                });
            } catch (err) {
                console.error(err);
            }
        }
    }, [activeTab, workbench, dispatch, sendMessage]);

    const saveFiles = useCallback(() => {
        if (engine) {
            engine.save();
            dispatch(setStatusMsg("Saving design..."));
        }
    }, [engine, dispatch]);

    const setEntryPoint = useCallback(() => {
        openModal({
            title: "Add Entry Point",
            render: ({close}) => {return <AddEntryPoint close={close} />;},
        });
    }, []);

    const refresh = useCallback(() => {
        const name = workbench.getName();
        sendMessage({"type": "load_design", "payload": {"fileName": name}});
    }, [workbench, sendMessage]);

    return (
        <div className="filebrowser-container">
            <div className="browser-container">
                <FileBrowser ref={fileBrowserRef} onSelectFile={onSelectFile}/>
            </div>
            <div className="menu">
                <div className="left-menu">
                    <TerminalPlus onClick={setEntryPoint} className="icon"/>
                </div>
                <div className="right-menu">
                    <ArrowClockwise onClick={refresh} className="icon"/>
                    <Floppy onClick={saveFiles} className="icon"/>
                    <PlusSquare onClick={createFile} className="icon"/>
                    <Trash onClick={deleteFile} className="icon"/>
                </div>
            </div>
        </div>
    );
}
