import path from "node:path";
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

/**
 * Loads the directory along with its contents into file tree described
 * in a JSON file.
 * 
 * @param {String} Path to the directory being read.
 * @returns {Object} Directory JSON
 */
const loadDir = async function (rootPath, folderPath, level) {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    return Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(folderPath, entry.name);

        const relativePath = path.join(
            path.basename(rootPath),
            path.relative(rootPath, folderPath),
            entry.name
        );

        if (entry.isDirectory()) {
            return {
                name: entry.name,
                type: 'folder',
                uid: relativePath,
                path: relativePath,
                children: await loadDir(rootPath, fullPath, level + 1),
                collapsed: true,
                level: level
            };
        } else {
            let content;
            let readOnly;
            if (entry.name.endsWith(".clp.zst")) {
                content =  await fs.readFile(fullPath);
                readOnly = true;
            }else {
                content =  await fs.readFile(fullPath, "utf-8");
                readOnly = false;
            }

            return {
                name: entry.name,
                type: 'file',
                uid: relativePath,
                path: relativePath,
                readOnly: readOnly,
                content: content,
                updatedContent: content,
                level: level
            };
        }
    }));
};

export default loadDir;