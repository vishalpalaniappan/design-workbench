import fs from 'fs/promises';
import path from "node:path";
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import loadImplementationInPlayground from './loadImplementationInPlayground.js';
import loadDir from './loadDir.js';

/**
 * Loads a design from the workspace with the given name.
 * @param {String} designName 
 * @returns {Object} Design data including fileName, path and data.
 */
async function loadDesign(designName) {
    try {
        const designPath = path.join(process.cwd(), "workspace", designName);
        const files = await loadDir(designPath, designPath, 0)

        // Write engine files to playground folder
        // await loadImplementationInPlayground(engine);

        return {
            fileName: designName,
            files: files
        };
    } catch (err) {
        console.error(err);
    }
}
export default loadDesign;