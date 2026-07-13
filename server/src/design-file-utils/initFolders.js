import fs from "fs/promises";
import path from "node:path";

/**
 * Clears the folder.
 */
async function clearFolder(folder) {
    // Remove contents of folder if it exists
    const folderPath = path.join(process.cwd(), folder);
    const entries = await fs.readdir(folderPath);

    await Promise.all(
        entries.map((entry) =>
            fs.rm(path.join(folderPath, entry), {
                recursive: true,
                force: true
            })
        )
    );
}

/**
 * Initializes the workspace folder. The workspace folder is where the designs are stored.
 * 
 * The playground folder is used to make the implementation files in the engine
 * accessible for executing the code in the design. It will be extended to execute
 * the instrumented code and the generated traces will be stored in the engine.
 */
async function createRequiredFolders() {
    // Create workspace folder if it doesn't exist
    const workspacePath = path.join(process.cwd(), "workspace");
    try {
        await fs.mkdir(workspacePath);
    } catch (err) {
        if (err.code === "EEXIST") {
            // Directory already exists.
        } else {
            throw err;
        }
    }
    // Create playground folder if it doesn't exist
    const playgroundPath = path.join(process.cwd(), "playground");
    try {
        await fs.mkdir(playgroundPath);
    } catch (err) {
        if (err.code === "EEXIST") {
            // Already exists, clear the folder
            await clearFolder("playground");
        } else {
            throw err;
        }
    }
    // Create TEMP folder if it doesn't exist
    const tempPath = path.join(process.cwd(), "temp");
    try {
        await fs.mkdir(tempPath);
    } catch (err) {
        if (err.code === "EEXIST") {
            // Already exists, clear the folder
            await clearFolder("temp");
        } else {
            throw err;
        }
    }
}

export { clearFolder, createRequiredFolders };