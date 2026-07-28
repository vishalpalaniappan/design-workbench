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
const loadDir = async function (rootPath, folderPath) {
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
                uid: "dir-" + randomUUID(),
                path: relativePath,
                children: await loadDir(rootPath, fullPath),
            };
        } else {
            return {
                name: entry.name,
                type: 'file',
                uid: "file-" + randomUUID(),
                path: relativePath,
                content: await fs.readFile(fullPath, 'utf-8'),
            };
        }
    }));
};

export default loadDir;