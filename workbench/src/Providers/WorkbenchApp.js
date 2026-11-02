import { DesignValidator } from "./DesignValidator/DesignValidator";

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
     *
     */
    constructor () {
        this.files = [];
        this.asts = {};
        this.graphBehaviors = {};
    }
    /**
     * Sets the name of the workbench.
     *
     * @param {String} name
     */
    setName (name) {
        this.designName = name;
    }

    /**
     * Gets the design name
     *
     * @return {String}
     */
    getName () {
        return this.designName;
    }

    /**
     * Adds the files
     *
     * @param {Object} files
     */
    addFiles (files) {
        this.files = files;
        this.getRunSyntax();
    }

    /**
     * Add a file
     * @param {String} fileName
     * @param {String} content
     *
     * @return {Object}
     */
    addFile (fileName, content) {
        const f = {
            name: fileName,
            type: "file",
            uid: this.designName + "/" + fileName,
            path: this.designName + "/" + fileName,
            readOnly: false,
            content: content,
            updatedContent: content,
            level: 0,
        };
        this.files.push(f);
        return f;
    }

    /**
     * Get the file given the file name.
     * @param {String} fName File Name
     * @return {Object|null} File object.
     */
    getFile (fName) {
        return this.flatTree.find((f) => f.name === fName);
    }

    /**
     * Get the file using the UID of the file.
     * @param {String} uid UID of file.
     * @return {Object} file
     */
    getFileUsingUid (uid) {
        // const file = this.files.find((file) => file.uid === uid);
        this.visitTree(this.files, uid);
        return this.foundFile;
    }

    /**
     * Visits the node in the tree.
     * @param {Object} tree
     * @param {String} uid
     */
    visitTree (tree, uid) {
        for (const node of tree) {
            if (node.type === "folder") {
                this.visitTree(node["children"], uid);
            } else if (node.uid === uid) {
                this.foundFile = node;
                break;
            }
        }
    }

    /**
     * Flatten the tree into an array.
     * @param {Object} tree 
     * @param {Number} level 
     * @return {Array}
     */
    flattenTree = (tree, level) => {
        if (!level) {
            level = 0;
        }
        let rows = [];
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            node.level = level;
            rows.push(node);
            if (node?.children) {
                rows = rows.concat(this.flattenTree(node.children, level + 1));
            }
        }
        return rows;
    };

    /**
     * Set the updated content of file
     * @param {String} uid File UID
     * @param {String} content Updated Content
     */
    setUpdatedContent (uid, content) {
        const file = this.getFileUsingUid(uid);
        if (file) {
            file.updatedContent = content;
        } else {
            throw new Error(`File with ${uid} was not found`);
        }
    }

    /**
     * Server says that file is saved.
     * @param {String} uid uid of file.
     * @return {Object}
     */
    fileSaved (uid) {
        const file = this.getFileUsingUid(uid);
        if (file) {
            file.content = file.updatedContent;
        } else {
            throw new Error(`File with ${uid} was not found`);
        }
        return file;
    }

    /**
     * TODO: Implement this method to get the run command from the
     * metadata.json file in the synthesized output folder. This is
     * useful because it will provide the command to run the synthesized
     * program or programs (for concurrent designs).
     */
    getRunSyntax () {
        this.flatTree = this.flattenTree(this.files);
        const path = this.designName + "/synthesized/metadata.json";
        const found = this.flatTree.find((file) => file.path == path);
        if (!found) {
            return;
        }
        const metadata = JSON.parse(found.content);
        const commands = metadata["commands"];
        if (commands.length === 1) {
            this.runCommand = commands[0];
        }
    }

    /**
     * Returns the command to run the design.
     * @return {String|null}
     */
    getRunCommand () {
        return this.runCommand;
    }

    /**
     * Saves the AST in the workbench app.
     * @param {Object} asts
     *
     */
    saveAst (asts) {
        for (const fName of Object.keys(asts)) {
            const validator = new DesignValidator(asts[fName]);
            validator.run();
            asts[fName] = validator.ast;
            this.graphBehaviors[fName] = validator.behaviors;
            // this.addFile(fName, JSON.stringify(validator.ast, null, 1));
        }
    }

    /**
     * Returns the AST for this design.
     * @return {Object}
     */
    getAst () {
        return this.ast;
    }
}

const workbench = new WorkbenchApp();

export default workbench;
