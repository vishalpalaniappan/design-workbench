import path from 'path';
import { clearFolder } from "./initFolders.js";
import instrumentationRunner from '../runners/instrumentationRunner.js';
import unzipper from "unzipper";
import fs from 'fs/promises';
import { json } from 'stream/consumers';

async function loadImplementationInPlayground(engine) {
    // Get files from engine.
    const files = engine.getFiles();

    // Clear playground folder
    await clearFolder("playground");

    // Write engine files to playground folder
    const playgroundPath = path.join(process.cwd(), "playground");

    let foundFile;
    for (const file of files) {
        if (file.getName() === "synthesized.py") {
            foundFile = file;
        }
    }

    if (!foundFile) {
        return null;
    }

    const meta = {designName: engine._name};
    await fs.writeFile(path.join(playgroundPath, "meta.json"), JSON.stringify(meta));
    await fs.writeFile(path.join(playgroundPath, "synthesized.py"), foundFile.getUpdatedContent(), "utf8");
}


export default loadImplementationInPlayground;