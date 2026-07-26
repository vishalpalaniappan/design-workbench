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

    // Load all the files into the playground
    for (const file of files) {
        await fs.writeFile(path.join(playgroundPath, file.getName()), file.getUpdatedContent(), "utf8");
    }
    await fs.writeFile(path.join(playgroundPath, "meta.json"), JSON.stringify({designName: engine._name}));
}


export default loadImplementationInPlayground;