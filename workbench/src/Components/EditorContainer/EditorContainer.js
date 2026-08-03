import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {useDispatch} from "react-redux";
import {Editor} from "sample-ui-component-library";
import {useLayoutEventSubscription} from "ui-layout-manager-dev";
import {useModalManager} from "ui-layout-manager-dev";

import ServerContext from "../../Providers/ServerContext";
import {setActiveTab} from "../../Store/appSlice";
import {mapStatementToBehaviorThunk} from "../../Store/appThunk";
import {setUpdatedContentThunk} from "../../Store/appThunk";
import {useEngineFiles} from "../../Store/useAppSelection";
import {useActiveTab, useLastSaved, useSelectedBehavior} from "../../Store/useAppSelection";
import {useSelectedParticipant} from "../../Store/useAppSelection";
import {useSelectedMapping} from "../../Store/useAppSelection";

import "./EditorContainer.scss";

/**
 * Component to display the design metadata.
 * @return {JSX.Element}
 */
export function EditorContainer () {
    const {connectionStatus} = useContext(ServerContext);
    const editorRef = useRef(null);
    const parentIdRef = useRef(null);
    const files = useEngineFiles();
    const lastSaved = useLastSaved();
    const {openModal} = useModalManager();
    const [editorLoaded, setEditorLoaded] = useState(false);

    const activeTab = useActiveTab();
    const dispatch = useDispatch();

    useEffect(() => {
        if (files) {
            // Close tabs of files that were deleted
            const _tabs = editorRef.current.getTabs();
            for (let i = 0; i < _tabs.length; i++) {
                const _tab = _tabs[i];
                const file = files.find((file) => file.uid === _tab.uid);
                if (!file) {
                    editorRef.current.closeTab(_tab.uid);
                } else {
                    editorRef.current.updateTab(file);
                }
            }
            editorRef.current.layoutEditor();
        }
    }, [files, editorLoaded]);

    useEffect(() => {
        if (lastSaved && files && editorRef.current) {
            /**
             * Inside editor, the content of the tab is saved in
             * updatedContent key. When updatedContent and content keys are
             * not the same, it means the file is dirty (shows icon on tab).
             * When the file is saved onto the server, the updated content
             * is set to the content key of the file, so we need to update
             * the content of the tab to reflect that.
             */
            const tabs = editorRef.current.getTabs();
            files.forEach((file) => {
                if (tabs.some((tab) => tab.uid === file.uid)) {
                    editorRef.current.updateTab(file);
                }
            });
        }
    }, [lastSaved]);

    useEffect(() => {
        if (activeTab && editorRef.current) {
            const foundFile = files.find((file) => file.uid === activeTab);
            if (!foundFile) {
                console.error("Active tab file not found in engine files");
                return;
            }
            const found = editorRef.current.getTabs().some((tab) => tab.uid === activeTab);
            if (found) {
                editorRef.current.selectTab(foundFile.uid);
                return;
            }
            editorRef.current.addTab(foundFile);
        }
    }, [activeTab, editorLoaded]);

    useLayoutEventSubscription("drag:drop", (event) => {
        const drop = event.payload;
        if (!drop?.overId) return;
        if (!drop.activeData?.node || !drop.overData) return;

        const activeType = drop.activeData.type;
        const overType = drop.overData.type;
        const activeParent = drop.activeData.parentId;
        const overParent = drop.overData.parentId;

        // Only drop files, not folders.
        if (drop.activeData.node.type !== "file") return;

        if (activeType === "EditorTab" && overType === "EditorTabGutter") {
            if (activeParent === overParent) {
                // Moving within same editor
                if (overParent === parentIdRef.current) {
                    editorRef.current.moveTab(drop.activeData.node.uid, drop.overData.index);
                }
            } else {
                // Moving between editors, need to remove the tab that was moved
                if (overParent === parentIdRef.current) {
                    editorRef.current.addTab(drop.activeData.node, drop.overData.index);
                } else if (activeParent === parentIdRef.current) {
                    editorRef.current.closeTab(drop.activeData.node.uid);
                }
            }
        } else if (activeType === "FileTreeNode" && overType === "EditorTabGutter"
            && overParent === parentIdRef.current) {
            // Moving from fileTree to editor
            editorRef.current.addTab(drop.activeData.node, drop.overData.index);
        }
    });

    const onSelectTab = useCallback((tab) => {
        if (editorLoaded) {
            if (tab !== activeTab) {
                dispatch(setActiveTab(tab && tab.uid));
            }
        } else {
            setEditorLoaded(true);
        }
    }, [dispatch, activeTab, editorLoaded]);

    useEffect(() => {
        parentIdRef.current = crypto.randomUUID();
        editorRef.current.setTabGroupId(parentIdRef.current);
    }, [connectionStatus]);

    const onContentChange = useCallback((tab, newContent) => {
        dispatch(setUpdatedContentThunk(tab.uid, newContent));
    }, [dispatch, files]);

    return (
        <Editor
            ref={editorRef}
            onContentChange={onContentChange}
            onSelectTab={onSelectTab}/>
    );
}
