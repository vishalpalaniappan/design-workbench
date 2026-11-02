import fs from 'fs/promises';
import path from "node:path";

/**
 * Deletes the design with the name from the workspace.
 * @param {String} designName 
 */
async function deleteDesign(designName) {
    try {
        const workspaceDir = path.join(process.cwd(), "workspace", designName);
        await fs.rm(workspaceDir, {
            recursive: true,
            force: true,
        });
    } catch (err) {
        throw new Error(err);
    }
}
export default deleteDesign;