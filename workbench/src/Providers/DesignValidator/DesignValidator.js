import {DesignGraph} from "./DesignGraph";

/**
 * This class accepts the AST of the DAL script and does the following:
 * - Identifies semantic correctness (unavailable participants etc.)
 * - Establishes the internal consistency of the design
 * - Identifies if the design is underspecified
 * - Extracts directed graph used to build visual representation
 * - Identifies invariants from the transformations
 */
export class DesignValidator {
    /**
     * Initialize the deisgn object.
     * @param {Object} ast
     */
    constructor (ast) {
        this.ast = ast;
        this.currentBehavior;
        this.behaviors = [];
        this.semanticGraph = new DesignGraph();
    }

    /**
     * Runs the validator.
     * @return {Object}
     */
    run() {
        this.processTree(this.ast);
        console.log(this.behaviors);
        return this.behaviors;
    }

    /**
     * Processes the tree recursively.
     * @param {Object} node 
     */
    processTree (node) {
        if ("body" in node) {
            for (const child of node["body"]) {
                if (child["type"] === "behavior") {
                    this.processBehavior(child);
                    this.processTree(child);
                    this.behaviors.push({...this.currentBehavior});
                    this.currentBehavior = null;
                } else {
                    this.processChild(child);
                    this.processTree(child);
                }
            }
        }
    }

    /**
     * Process a node in the tree.
     * @param {Object} behavior
     */
    processBehavior (behavior) {
        this.currentBehavior = {
            name: behavior["behaviorName"],
            uid: crypto.randomUUID(),
            createdParticipants: [],
            participants: [],
            transformations: [],
            nextBehaviors: [],
        };
    }

    /**
     * Process the child
     * @param {Object} child 
     */
    processChild (child) {
        const t = child["type"];
        const c = child["command"];
        if (t === "cmd") {
            if (c === "select") {
                this.currentBehavior.nextBehaviors.push(child.args[0].value);
            } else if (c === "create") {
                this.currentBehavior.createdParticipants.push(child.args);
            } else if (c === "worldStateManager") {
                this.currentBehavior.participants.push({
                    type: child.args[1].value,
                    participant: child.args[2].value,
                });
            }
        } else if (t === "registeredCmd") {
            const output = child.args[0].value;
            this.currentBehavior.transformations.push({
                command: child.command,
                output: output,
                participants: child.args.slice(1),
            });
        }
    }

    /**
     * Find where the participant was added to the behavior.
     * @param {String} participant
     * 
     * @return {Object|null}
     */
    getPossibleProvenanceBehavior (participant) {
        // TODO: Multiple behaviors can be origin.
        console.log("Inspecting participant:", participant);
        for (const behavior of this.behaviors) {
            for (const transform of behavior.participants) {
                if (transform.type === "add" && transform.participant === participant) {
                    return behavior;
                }
            }
        }
    }


    /**
     * Get the behavior.
     * @param {String} behaviorName Name of the behavior.
     * @return {null|String}
     */
    getBehavior (behaviorName) {
        return this.behaviors.find((value) => value.name === behaviorName);
    }

    /**
     * Checks that a path exists from behavior A to B
     * @param {String} fromBehavior
     * @param {String} toBehavior
     */
    pathExists (fromBehavior, toBehavior) {
        // Walk every path to see if it reaches target
        // Terminate if an already visited behavior is visited again
        console.log(`Finding path from ${fromBehavior} to ${toBehavior}`);
        this.walkPath(fromBehavior, toBehavior, []);
    }

    /**
     * Walk path from behavior to behavior and save in path.
     * @param {String} startBehavior
     * @param {String} endBehavior
     * @param {Array} path
     *
     * @return {Null|Array}
     */
    walkPath (startBehavior, endBehavior, path) {
        const currBehavior = this.getBehavior(startBehavior);
        const targetBehavior = this.getBehavior(endBehavior);
        // console.log(currBehavior, targetBehavior);

        if (!currBehavior || !targetBehavior) {
            console.warn("Behavior not found");
            return;
        }

        if (path.includes(startBehavior)) {
            path.push(startBehavior);
            console.log("Looped Path:");
            console.log(path);
            return path;
        } else if (startBehavior === endBehavior) {
            path.push(startBehavior);
            console.log("Valid Path from create to transform:");
            console.log(path);
            return path;
        }

        path.push(startBehavior);
        if (currBehavior.nextBehaviors.length > 1) {
            for (const next of currBehavior.nextBehaviors) {
                this.walkPath(next, endBehavior, path);
            }
        } else if (currBehavior.nextBehaviors.length === 1) {
            this.walkPath(currBehavior.nextBehaviors[0], endBehavior, path);
        }
    }
}
