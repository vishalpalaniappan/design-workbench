import { DesignGraph } from "./DesignGraph";

/**
 * This class accepts the AST of the DAL script and does the following:
 * - Identifies semantic correctness (unavailable participants etc.)
 * - Establishes the internal consistency of the design
 * - Identifies if the design is underspecified
 * - Extracts directed graph used to build visual representation
 * - Identifies invariants from the transformations
 */
export class DesignValidator {

    constructor (ast) {
        this.ast = ast;
        this.currentBehavior;
        this.semanticGraph = new DesignGraph();
    }

    run() {
        this.processTree(this.ast);
        console.log(JSON.stringify(this.behaviors, null, 4));
    }

    processTree(node) {
        if ("body" in node) {
            for (const child of node["body"]) {
                if (child["type"] === "behavior") {
                    this.currentBehavior = child;
                    this.processBehavior(child);
                }
                this.processTree(child)
            }
        }
    }

    processBehavior(behavior) {
        const behaviorName = behavior["behaviorName"];
        const primitiveTransformations = [];
        const opaqueTransformations = [];
        const createdParticipants = [];
        let nextBehaviorName;
        for (const child of behavior["body"]) {

            const cmd = child["command"];
            const type = child["type"];

            if (type === "cmd") {
                if (cmd === "select") {
                    nextBehaviorName = child["args"][0]["value"];
                } else if (cmd === "create") {
                    createdParticipants.push(child.args);
                } else if (cmd === "run") {
                    this.semanticGraph.addEntryBehavior(child["args"][0]["value"]);
                } else {
                    primitiveTransformations.push(cmd);
                }
            } else if (type === "registeredCmd") {
                opaqueTransformations.push(cmd);
            }
        }

        /**
         * I am grouping the primitive and opaque transformations
         * separately. I know the exact ast mapping for the primitive
         * transformation and I can automatically identify the invariant
         * that is defined by the transformation.
         * 
         * However, I will allow convention to specify a transformation
         * and the invariants that it enforces on the participants.
         * This will allow a solution that can scale more easily. 
         * Even if I have opaque transformations, I can define its
         * semantics at the boundary.
         **/ 
        this.semanticGraph.addBehavior({
            name: this.currentBehavior["behaviorName"],
            createdParticipants: createdParticipants,
            primitiveTransformations: primitiveTransformations,
            opaqueTransformations: opaqueTransformations,
            nextBehavior: nextBehaviorName
        })
    }
}