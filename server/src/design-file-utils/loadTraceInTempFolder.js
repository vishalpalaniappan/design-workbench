import path from 'path';
import { resolveDesignPath } from "./validateDesignName.js";
import {DALEngine} from "dal-engine-core-js-lib-dev";
import fs from 'fs/promises';

async function loadTraceInTempFolder(designName, traceUid) {
    const filePath = resolveDesignPath(designName);
    const data = await fs.readFile(filePath);

    // Create engine and deserialize data from file
    const engine = new DALEngine({
        name: designName,
        description: "Default engine",
    });
    engine.deserialize(data);

    const trace = engine.traces.getTrace(traceUid);

    const tempDir = path.join(process.cwd(), "temp");
    await fs.mkdir(tempDir, { recursive: true });

    const traceFilePath = path.join(tempDir, traceUid);
    await fs.writeFile(traceFilePath, trace.trace);
}


export default loadTraceInTempFolder;