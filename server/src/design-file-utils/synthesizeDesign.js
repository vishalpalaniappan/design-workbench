import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';

import synthesisRunner from '../runners/synthesisRunner.js';

async function synthesizeDesign(designName, ast) {
    const tempDir = path.join(process.cwd(), "temp");
    const traceFilePath = path.join(tempDir, "ast.json");
    await fs.writeFile(traceFilePath, JSON.stringify(ast, null, 4));

    let synthesizedOutput;
    try {
        synthesizedOutput = await synthesisRunner(JSON.stringify(ast));
    } catch (error) {
        throw error;
    }

    return synthesizedOutput;
}


export default synthesizeDesign;