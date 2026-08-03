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
    ImplementationToolbar: () =>
        import("./Components/ImplementationToolbar/ImplementationToolbar").then((m) => ({
            default: m.default || m.ImplementationToolbar,
        }))
};
