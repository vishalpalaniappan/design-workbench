import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';
import { copyFile, rm, mkdir } from "fs/promises";

import synthesisRunner from '../runners/synthesisRunner.js';
import { json } from 'stream/consumers';

async function synthesizeDesign(designName, ast, verbosity) {
    const tempDir = path.join(process.cwd(), "temp");
    const traceFilePath = path.join(tempDir, "ast.json");
    await fs.writeFile(traceFilePath, JSON.stringify(ast, null, 4));

    let synthesizedOutput;
    try {
        synthesizedOutput = await synthesisRunner(JSON.stringify(ast), verbosity);
    } catch (error) {
        throw error;
    }

    const synthObj = JSON.parse(synthesizedOutput.toString());
    const synthPath = path.join(process.cwd(), "workspace", designName, "synthesized");
    await rm(synthPath, { recursive: true, force: true });
    await mkdir(synthPath, { recursive: true });

    for (const [name, value] of Object.entries(synthObj)) {
        const filePath = path.join(process.cwd(), "workspace", designName, "synthesized", name);
        await fs.writeFile(filePath, value);
    }

    // Copy the required files to the synthesized folder
    const metadata = JSON.parse(synthObj["metadata.json"])
    for (const file of metadata["required"]) {
        const fromPath = path.join(process.cwd(), "workspace", designName, "includes", file);
        const toPath = path.join(process.cwd(), "workspace", designName, "synthesized", file);
        await copyFile(fromPath, toPath);
    }

    return synthesizedOutput;
}


export default synthesizeDesign;