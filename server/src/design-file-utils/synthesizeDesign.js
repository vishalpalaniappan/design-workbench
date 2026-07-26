import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';

import synthesisRunner from '../runners/synthesisRunner.js';

async function synthesizeDesign(designName, ast) {
    let synthesizedOutput;
    try {
        synthesizedOutput = await synthesisRunner(JSON.stringify(ast));
    } catch (error) {
        throw error;
    }

    return synthesizedOutput;
}


export default synthesizeDesign;