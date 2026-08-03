import fs from 'fs/promises';
import path from "node:path";

async function saveFile(fileName, folderPath, data) {
    const filePath = path.join(folderPath, fileName);
    await fs.writeFile(filePath, data);
}

export default saveFile;