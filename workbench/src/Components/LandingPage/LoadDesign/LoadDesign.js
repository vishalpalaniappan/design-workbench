import React, {useCallback, useContext, useEffect, useState} from "react";

import {ArrowRightSquare, Trash} from "react-bootstrap-icons";
import {useDispatch} from "react-redux";

import splashScreen from "../../../Assets/splash_screen.png";
import {useWorkspace} from "../../../Providers/GlobalProviders";
import ServerContext from "../../../Providers/ServerContext";
import {setDesignLoaded} from "../../../Store/appSlice";

import "./LoadDesign.scss";

/**
 * Presents the user with the option to load, create or delete
 * a design from the server. Also shows a nice splash screen :)
 * @return {JSX.Element}
 */
export function LoadDesign () {
    const {workspace, design} = useWorkspace();
    const [designs, setDesigns] = useState([]);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const {sendMessage, connectionStatus} = useContext(ServerContext);
    const [fileName, setFileName] = useState("");
    const [error, setErrror] = useState(null);
    const [lastUpdated, setLastUpdated] = useState("");
    const dispatch = useDispatch();

    // Update designs when workspace changes and check design to load from URL
    useEffect(() => {
        if (workspace) {
            setDesigns(workspace);

            const params = new URLSearchParams(window.location.search);
            const designName = params.get("design");
            if (designName && !design) {
                // Given http://localhost:3011/?design=test.dal
                // Load test.dal if it exists in the workspace
                const _design = workspace.find((item) => item.name === designName);
                if (_design) {
                    sendMessage({"type": "load_design", "payload": {"fileName": _design.name}});
                }
            }
            // Set last updated and unselect design if it was deleted.
            setLastUpdated(new Date().toLocaleString());

            // If the selected design is not in workspace, unselect it.
            if (selectedDesign && !workspace.some((item) => item.name === selectedDesign?.name)) {
                dispatch(setDesignLoaded(false));
            }
        }
    }, [workspace, setSelectedDesign, design, sendMessage]);

    // TODO:
    // If we are simply changing layouts and the design is already loaded,
    // set design loaded to true. This is a temporary solutiuon to quickly
    // change layouts and I will refactor this after I add the necessary
    // features to the layout manager.
    useEffect(() => {
        if (design) {
            const params = new URLSearchParams(window.location.search);
            const designName = params.get("design");
            if (designName && designName === design.fileName) {
                setTimeout(() => {
                    dispatch(setDesignLoaded(true));
                }, 4);
            }
        }
    }, [design, dispatch]);

    // Create design (workspace is updated after creation by server)
    const newDesign = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setErrror(null);

        // Note connected to server.
        if (connectionStatus !== "Connected") return;

        // No file name provided.
        if (!fileName || !fileName.trim()) return;

        // Validate file name.
        const fName = fileName.endsWith(".dal")
            ? fileName
            : `${fileName}.dal`;
        if (!/^[A-Za-z0-9_-]+\.dal$/.test(fName)) {
            setErrror("Use letters, numbers, underscores, or dashes only.");
            return;
        }

        // Check if design with same name already exists.
        const fExists = designs.some((design) => design.name === fName);
        if (fExists) {
            setErrror(`Design named ${fName} already exists`);
            return;
        }

        // If all checks pass, create design.
        sendMessage({"type": "create_design", "payload": {"fileName": fName}});
        setSelectedDesign(null);
    }, [fileName, sendMessage, connectionStatus]);

    // Delete the design from server (workspace is updated after deletion)
    const deleteDesign = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (connectionStatus !== "Connected") return;
        if (!selectedDesign) return;
        sendMessage({"type": "delete_design", "payload": {"fileName": selectedDesign.name}});
    }, [selectedDesign, sendMessage, connectionStatus]);

    // Select file and load if flag is set (ex. double click)
    const selectFile = (e, design, load) => {
        e.stopPropagation();
        setErrror(null);
        setSelectedDesign(design);
        if (load) {
            loadDesign();
        }
    };

    // Load selected design from server
    const loadDesign = useCallback(() => {
        if (!selectedDesign) return;
        sendMessage({"type": "load_design", "payload": {"fileName": selectedDesign.name}});
    }, [selectedDesign, sendMessage]);

    const getDesignList = useCallback(() => {
        if (connectionStatus === "Connected" && designs.length > 0) {
            return <div className="files">
                {designs.map((design) => (
                    <div key={design.uid}
                        onClick={(e) => selectFile(e, design)}
                        onDoubleClick={(e) => selectFile(e, design, true)}
                        className="file"
                        style={design?.uid === selectedDesign?.uid ?
                            {backgroundColor: "#3a4a5c"} : {}}>
                        {design.name}
                    </div>
                ))}
            </div>;
        } else if (connectionStatus === "Connected" && designs.length === 0) {
            return <div className="no-designs">
                No designs found.
            </div>;
        } else {
            return <div className="no-connection">
                Not connected to server...
            </div>;
        }
    }, [connectionStatus, selectFile, designs]);

    return (
        <div className="landing-page">
            <div className="splash">
                <div className="left">
                    <img src={splashScreen} alt="Blueprint city" />
                </div>
                <div className="right">
                    <div className="title-container">Design Workbench</div>
                    <div className="create-design-row">
                        <input
                            className="file-name-input"
                            placeholder="Enter design name..."
                            value={fileName}
                            onKeyDown={(e) => (e.key === "Enter") && newDesign(e)}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                        <div className="create-btn" onClick={newDesign}>+ Create</div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div
                        className="file-selector-container"
                        onClick={(e) => selectFile(e, null)}>
                        {getDesignList()}
                    </div>
                    <div className="button-row">
                        <div className="buttons-left">
                            <div className="last-updated">
                                Last updated: {lastUpdated && <span>{lastUpdated}</span>}
                            </div>
                        </div>
                        {selectedDesign &&
                            <div className="buttons-right">
                                <div className="icon-btn">
                                    <Trash size={16} onClick={deleteDesign} />
                                </div>
                                <div className="icon-btn" onClick={loadDesign}>
                                    <ArrowRightSquare size={16} />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
