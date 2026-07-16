import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';

import synthesisRunner from '../runners/synthesisRunner.js';

async function synthesizeDesign(designName) {
    const filePath = resolveDesignPath(designName);
    const data = await fs.readFile(filePath);

    const engine = new DALEngine({
        name: designName,
        description: "Default engine",
    });

    engine.deserialize(data);

    const activeBehavior = engine.graphs.getActiveGraph();

    let synthPkg = [];
    for (const node of activeBehavior.nodes) {
        const behaviorSynth = node.getBehavior().generateSynthesisPackage();
        synthPkg.push(behaviorSynth);
    }

    try {
        const synthesizedOutput = await synthesisRunner(synthPkg);
        console.log("Synthesis output:", synthesizedOutput.toString());
    } catch (error) {
        throw error;
    }
    
}


export default synthesizeDesign;