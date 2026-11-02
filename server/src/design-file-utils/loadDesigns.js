import path from "node:path";
import fs from 'fs/promises';

/**
 * Returns the list of designs in the workspace.
 * @returns {Object} List of designs in workspace.
 */
async function loadDesigns() {
    try {
        const workspacePath = path.join(process.cwd(), "workspace");
        const entries = await fs.readdir(workspacePath, { withFileTypes: true });
        const folders = entries
            .filter(entry => entry.isDirectory())
            .map(entry => ({
                    name: entry.name,
                    type: 'folder',
                    uid: entry.name
            }));
        return folders;
    } catch (err) {
        throw new Error(err);
    }
};


export default loadDesigns;
