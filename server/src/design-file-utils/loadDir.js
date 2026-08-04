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
    const visibleEntries = entries.filter(entry => !entry.name.startsWith("."));
    return Promise.all(visibleEntries.map(async (entry) => {
        const fullPath = path.join(folderPath, entry.name);

        const relativePath = path.join(
            path.basename(rootPath),
            path.relative(rootPath, folderPath),
            entry.name
        );

        if (entry.isDirectory()) {
            // Ignore hidden directories
            return {
                name: entry.name,
                type: 'folder',
                uid: "dir-" + randomUUID(),
                path: relativePath,
                children: await loadDir(rootPath, fullPath, level + 1),
                collapsed: true,
                level: level
            };
        } else {
            const content =  await fs.readFile(fullPath, 'utf-8');
            return {
                name: entry.name,
                type: 'file',
                uid: "file-" + randomUUID(),
                path: relativePath,
                content: content,
                updatedContent: content,
                level: level
            };
        }
    }));
};

export default loadDir;