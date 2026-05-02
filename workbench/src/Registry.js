/* eslint-disable max-len */
export const registry = {
    BehavioralControlGraph: () =>
        import("./Components/BehavioralControlGraph/BehavioralControlGraph").then((m) => ({
            default: m.default || m.BehavioralControlGraph,
        })),
    EditorContainer: () =>
        import("./Components/EditorContainer/EditorContainer").then((m) => ({
            default: m.default || m.EditorContainer,
        })),
    FileSelector: () =>
        import("./Components/FileSelector/FileSelector").then((m) => ({
            default: m.default || m.FileSelector,
        })),
    PtyTerminal: () =>
        import("./Components/PtyTerminal/PtyTerminal").then((m) => ({
            default: m.default || m.PtyTerminal,
        })),
    ToolBar: () =>
        import("./Components/ToolBar/ToolBar").then((m) => ({
            default: m.default || m.ToolBar,
        })),
    StatusBar: () =>
        import("./Components/StatusBar/StatusBar").then((m) => ({
            default: m.default || m.StatusBar,
        })),
    GraphMenuBar: () =>
        import("./Components/GraphMenuBar/GraphMenuBar").then((m) => ({
            default: m.default || m.GraphMenuBar,
        })),
    NodeInfo: () =>
        import("./Components/NodeInfo/NodeInfo").then((m) => ({
            default: m.default || m.NodeInfo,
        })),
    SelectedInfo: () =>
        import("./Components/SelectedInfo/SelectedInfo").then((m) => ({
            default: m.default || m.SelectedInfo,
        })),
    MappingInfo: () =>
        import("./Components/MappingInfo/MappingInfo").then((m) => ({
            default: m.default || m.MappingInfo,
        })),
    SideBarMenu: () =>
        import("./Components/SideBarMenu/SideBarMenu").then((m) => ({
            default: m.default || m.SideBarMenu,
        })),
    TraceSelector: () =>
        import("./Components/TraceSelector/TraceSelector").then((m) => ({
            default: m.default || m.TraceSelector,
        })),
    InitialArgsEditor: () =>
        import("./Components/Scripting/editors/scriptingEditors").then((m) => ({
            default: m.default || m.InitialArgsEditor,
        })),
    InitialWorldStateEditor: () =>
        import("./Components/Scripting/editors/scriptingEditors").then((m) => ({
            default: m.default || m.InitialWorldStateEditor,
        })),
    PrimitivesEditor: () =>
        import("./Components/Scripting/primitivesEditor/primitivesEditor").then((m) => ({
            default: m.default || m.PrimitivesEditor,
        })),
    ExpectedPostWorldStateEditor: () =>
        import("./Components/Scripting/editors/scriptingEditors").then((m) => ({
            default: m.default || m.ExpectedPostWorldStateEditor,
        })),
    ScriptingToolBar: () =>
        import("./Components/Scripting/ScriptingToolBar/ScriptingToolBar").then((m) => ({
            default: m.default || m.ScriptingToolBar,
        })),
    TransformationOutputViewer: () =>
        import("./Components/Scripting/outputViewer/transformationOutputViewer").then((m) => ({
            default: m.default || m.TransformationOutputViewer,
        })),
    TransformationOutputLogViewer: () =>
        import("./Components/Scripting/outputLogViewer/transformationOutputLogViewer").then((m) => ({
            default: m.default || m.TransformationOutputLogViewer,
        })),
    TransformOutputMeta: () =>
        import("./Components/Scripting/transformOutputMeta/transformOutputMeta").then((m) => ({
            default: m.default || m.TransformOutputMeta,
        })),
    DebuggingToolBar: () =>
        import("./Components/Debugging/DebuggingToolBar/DebuggingToolBar").then((m) => ({
            default: m.default || m.DebuggingToolBar,
        })),
    TraceBehaviorSelector: () =>
        import("./Components/Debugging/TraceBehaviorSelector/TraceBehaviorSelector").then((m) => ({
            default: m.default || m.TraceBehaviorSelector,
        })),
    DebuggerBehaviorInitialArgs: () =>
        import("./Components/Debugging/viewers/debuggingInfoViewers").then((m) => ({
            default: m.default || m.DebuggerBehaviorInitialArgs,
        })),
    DebuggerBehaviorInitialWorldState: () =>
        import("./Components/Debugging/viewers/debuggingInfoViewers").then((m) => ({
            default: m.default || m.DebuggerBehaviorInitialWorldState,
        })),
    DebuggerBehaviorExpectedPostWorldState: () =>
        import("./Components/Debugging/viewers/debuggingInfoViewers").then((m) => ({
            default: m.default || m.DebuggerBehaviorExpectedPostWorldState,
        })),
    DebuggerBehaviorTransformOutput: () =>
        import("./Components/Debugging/viewers/debuggingInfoViewers").then((m) => ({
            default: m.default || m.DebuggerBehaviorTransformOutput,
        })),
    DebuggerBehaviorScript: () =>
        import("./Components/Debugging/viewers/debuggingInfoViewers").then((m) => ({
            default: m.default || m.DebuggerBehaviorScript,
        })),
    DebuggerTransformOutputMetadata: () =>
        import("./Components/Debugging/viewers/debuggingInfoViewers").then((m) => ({
            default: m.default || m.DebuggerTransformOutputMetadata,
        })),
    RootCauseContainer: () =>
        import("./Components/Debugging/RootCauseContainer/RootCauseContainer").then((m) => ({
            default: m.default || m.RootCauseContainer,
        })),
    ImplementationToolbar: () =>
        import("./Components/ImplementationToolbar/ImplementationToolbar").then((m) => ({
            default: m.default || m.ImplementationToolbar,
        })),
};
