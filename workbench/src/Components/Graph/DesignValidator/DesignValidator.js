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
            createdParticipants: [],
            participants: [],
            primitiveTransformations: [],
            opaqueTransformations: [],
            nextBehaviors: [],
        };
    }

    /**
     * Process the child
     * @param {Object} child 
     */
    processChild (child) {
        if (child["type"] === "cmd" && child["command"] === "select") {
            this.currentBehavior.nextBehaviors.push(child.args[0].value);
        } else if (child["type"] === "cmd" && child["command"] === "create") {
            this.currentBehavior.createdParticipants.push(child.args);
        }
    }
}
