import path from 'path';
import { clearFolder } from "./initFolders.js";
import instrumentationRunner from '../runners/instrumentationRunner.js';
import unzipper from "unzipper";
import fs from 'fs/promises';

async function loadImplementationInPlayground(engine) {
    // Get files from engine.
    const files = engine.getFiles();

    // Clear playground folder
    await clearFolder("playground");

    // Write engine files to playground folder
    const playgroundPath = path.join(process.cwd(), "playground");

    const instrumentationPkg = engine.implementation.exportForInstrumentation();

    // Temporarily write to temp folder for accesing instrumentation package
    const filePath = path.join("temp", engine._name + ".json");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, instrumentationPkg);

    const meta = {designName: engine._name};
    await fs.writeFile(path.join(playgroundPath, "meta.json"), JSON.stringify(meta));

    try {
        const zip = await instrumentationRunner(instrumentationPkg);
        const directory = await unzipper.Open.buffer(zip);
        await directory.extract({ path: playgroundPath });
    } catch (error) {
        throw error;
    }
}


export default loadImplementationInPlayground;