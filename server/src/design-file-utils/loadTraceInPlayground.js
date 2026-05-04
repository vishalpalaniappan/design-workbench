import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import { clearPlaygroundFolder } from "./initFolders.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';

async function loadTraceInPlayground(designName, traceUid) {
    const filePath = resolveDesignPath(designName);
    const data = await fs.readFile(filePath);

    // Create engine and deserialize data from file
    const engine = new DALEngine({
        name: designName,
        description: "Default engine",
    });
    engine.deserialize(data);

    const trace = engine.traces.getTrace(traceUid);
    const traceFilePath = path.join(process.cwd(), "playground", traceUid);
    await fs.writeFile(traceFilePath, trace.trace);
}


export default loadTraceInPlayground;