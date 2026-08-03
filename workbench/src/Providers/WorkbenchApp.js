
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

    /**
     * Get the file using the UID of the file.
     * @param {String} uid UID of file.
     * @return {Object} file
     */
    getFileUsingUid (uid) {
        const file = this.files.find((file) => file.uid === uid);
        return file;
    }

    /**
     * Set the updated content of file
     * @param {String} uid File UID
     * @param {String} content Updated Content
     */
    setUpdatedContent (uid, content) {
        const file = this.getFileUsingUid(uid);
        file.updatedContent = content;
    }
}

const workbench = new WorkbenchApp();

export default workbench;
