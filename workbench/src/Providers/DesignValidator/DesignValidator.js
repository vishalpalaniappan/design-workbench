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
        this.invariants = [];
        this.created = [];
    }

    /**
     * Runs the validator.
     * @return {Object}
     */
    run () {
        this.processTree(this.ast);
        console.log(this.behaviors);
        console.log("Created:", this.created);
        this.identifyProvenance();
        this.addInvariants(this.ast);
        console.log(this.ast);
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
                    // TODO: This would break for nested behaviors.
                    // I would have to add them to a stack.
                    this.createBehavior(child);
                    this.processTree(child);
                    this.processBehavior();
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
     * Process the child
     * @param {Object} child
     */
    processChild (child) {
        const t = child["type"];
        const c = child["command"];
        if (t === "cmd") {
            if (c === "select") {
                this.currentBehavior.nextBehaviors.push(child.args[0].value);
            } else if (c === "worldStateManager") {
                this.currentBehavior.worldState.push(child.args);
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
     * Process a node in the tree.
     * @param {Object} behavior
     */
    createBehavior (behavior) {
        this.currentBehavior = {
            name: behavior["behaviorName"],
            // creation: [],
            worldState: [],
            transformations: [],
            nextBehaviors: [],
        };
    }

    /**
     * Currently this function accesses the participant that were
     * created and saves their role.
     *
     * It then saves every participant that was accessed along with
     * their roles into the behavior.
     *
     * In the next pass, it will identify every participant used in
     * a transformation and then use the role to identify when it
     * was introduced into the world.This will then be used to automatically
     * the releavnt invariant in the correct location.
     *
     * @param {Object} behavior Behavior Info
     */
    processBehavior () {
        this.currentBehavior["accessedParticipants"] = [];
        this.currentBehavior.worldState.forEach((worldStateTransformArgs, index)=> {
            /**
             * The arguments for the world state transform are stored in a list
             * with each entry having a arg type. I identify if the transform
             * is a create or get, or getValue and then I also save the name and
             * role.
             */

            // Saves all the participants that were created in the behavior.
            let isCreate = false;
            let name = null;
            let role = null;
            for (const t of worldStateTransformArgs) {
                const isTransformation = (t.arg === "transformation");
                isCreate = (isTransformation && t.value === "create")?true:isCreate;
                name = (t.arg === "name")?t.value:name;
                role = (t.arg === "p_role")?t.value:role;
            }
            if (isCreate) {
                const nameRole = {name: name, role: role, behavior: this.currentBehavior.name};
                // this.currentBehavior["creation"].push(nameRole);
                this.created.push(nameRole);
            }

            // Saves all the participant that were accessed in the behavior.
            let isGet = false;
            name = null;
            role = null;
            for (const t of worldStateTransformArgs) {
                const isTransformation = (t.arg === "transformation");
                const v = t.value;
                isGet = (isTransformation && (v === "get" || v === "getValue"))?true:isGet;
                name = (t.arg === "name")?t.value:name;
                role = (t.arg === "p_role")?t.value:role;
            }
            if (isGet) {
                this.currentBehavior["accessedParticipants"].push({name: name, role: role});
            }
        });
    }

    /**
     * Identifies the provenance of the participants involved in
     * each transformation in a behavior.
     */
    identifyProvenance () {
        for (const behavior of this.behaviors) {
            behavior.transformations.forEach((transformation, index)=> {
                for (const p of transformation.participants) {
                    if (p.type !== "name") {
                        continue;
                    }
                    const name = p.value;
                    for (const acessedP of behavior["accessedParticipants"]) {
                        if (acessedP.name === name) {
                            p.role = acessedP.role;
                            p.provenanceBehavior = this.created.find(
                                (val) => val.role == acessedP.role
                            )?.behavior;
                            this.invariants.push({
                                behavior: p.provenanceBehavior,
                                transformBehavior: behavior.name,
                                transformation: transformation.command,
                                participant: name,
                            });
                        }
                    }
                }
            });
            delete behavior.worldState;
            delete behavior.accessedParticipants;
        }
    }

    /**
     * Visits nodes in the tree and adds invariant in the behavior block.
     * @param {Object} node 
     */
    addInvariants (node) {
        if ("body" in node) {
            for (const child of node["body"]) {
                if (child["type"] === "behavior") {
                    this.addInvariants(child);

                    const invariant = this.invariants.find(
                        (val) => val.behavior === child["behaviorName"]
                    );
                    if (invariant) {
                        const printVal = "f'Invariant for transformation " +
                            invariant["transformation"] +
                            " in behavior " +
                            invariant["transformBehavior"] +
                            "'";
                        const invariantBlock = {
                            "type": "invariant",
                            "args": [],
                            "body": [
                                {
                                    "type": "cmd",
                                    "command": "display",
                                    "args": [
                                        {
                                            "arg": null,
                                            "type": "string",
                                            "value": printVal,
                                        },
                                    ],
                                },
                            ],
                        };
                        child.body.splice(0, 0, invariantBlock);
                    };
                } else {
                    this.addInvariants(child);
                }
            }
        }
    }
}
