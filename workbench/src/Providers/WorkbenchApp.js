
/**
 * This class is temporary and it stores the repo contents so that
 * it can be accessed by the workbench in a strucured way.
 *
 * The engine will be reimplementd so that it can be instantiated
 * with the repo. This means that the engine will accept a design,
 * validate it, synthesize it, debugs the traces and learns from the traces.
 *
 * It will not contain the implementation or traces, this is a much more
 * maintainable way to build. I will replace this class with the engine
 * when I am ready but in the meantime, I will establish functionality
 * using this class.
 */
class WorkbenchApp {
    /**
     * Sets the name of the workbench.
     */
    setName () {
    }

    /**
     * Gets the design name
     */
    getName () {

    }

    /**
     * Adds the files
     *
     * @param {Object} files
     */
    addFiles (files) {
        this.files = files;
    }

    /**
     * Get the files
     * 
     * @return {Array} Files
     */
    getFiles () {
        return this.files.filter((file) => {
            return file.type === "file";
        });
    }
}

const workbench = new WorkbenchApp();

export default workbench;
