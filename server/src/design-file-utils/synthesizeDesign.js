import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';

import synthesisRunner from '../runners/synthesisRunner.js';

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
    for (const [name, value] of Object.entries(synthObj)) {
        const filePath = path.join(process.cwd(), "workspace", designName, name);
        await fs.writeFile(filePath, value);
    }

    return synthesizedOutput;
}


export default synthesizeDesign;