import { Graph } from "./Components/Graph/Graph";

/* eslint-disable max-len */
export const registry = {
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
    SideBarMenu: () =>
        import("./Components/SideBarMenu/SideBarMenu").then((m) => ({
            default: m.default || m.SideBarMenu,
        })),
    Graph: () =>
        import("./Components/Graph/Graph").then((m) => ({
            default: m.default || m.Graph,
        })),
    BehaviorInspector: () =>
        import("./Components/Graph/Graph").then((m) => ({
            default: m.default || m.BehaviorInspector,
        })),
    ImplementationToolbar: () =>
        import("./Components/ImplementationToolbar/ImplementationToolbar").then((m) => ({
            default: m.default || m.ImplementationToolbar,
        })),
};
