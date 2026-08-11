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
            if (c === "goToBehavior") {
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
                for (const [index, p] of transformation.participants.entries()) {
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
                                index: index + 1,
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
     * Get the behavior.
     * @param {String} behaviorName Name of the behavior.
     * @return {null|String}
     */
    getBehavior (behaviorName) {
        return this.behaviors.find((value) => value.name === behaviorName);
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

                    for (const invariant of this.invariants) {
                        if (invariant.behavior !== child["behaviorName"]) {
                            continue;
                        }

                        const sB = invariant["behavior"];
                        const tB = invariant["transformBehavior"];
                        console.log(`Finding path from ${sB} to ${tB}`);
                        this.walkPath(sB, tB, []);

                        const invCmd = invariant["transformation"].slice(1) +
                             "_invariant_" + invariant["index"];

                        const invViolationMessage = "f'Invariant " + invCmd + " for " +
                            invariant["participant"] + " in transformation " +
                            invariant["transformation"] + " in behavior " +
                            invariant["transformBehavior"] + "'";

                        /**
                         * For the invariant block, initial approach:
                         * - Invariant at position 1
                         *      - get value of arg 1
                         *      - command_invariant_1()
                         * - Invariant at position 2
                         *      - get value of arg 2
                         *      - command_invariant_2()
                         *
                         * - Invariant for both position 1 and position 2
                         *      - find path A from 1 to target
                         *      - find path B from 2 to target
                         *      - if 2 is in path A between 1 to target
                         *          - place at 2
                         *      - if 1 is in path B between 2 to target
                         *          - place at 1
                         *
                         * Finding the path wouldn't be too difficult because
                         * it is just following the next behavior until
                         * target is reached or a loop happens. I am seeing
                         * if there is a way to avoid this by eliminating
                         * ambiguity but I think in this case, the ambiguity
                         * is eliminated using the graph.
                         */
                        const invariantBlock = {
                            "type": "invariant",
                            "args": [],
                            "body": [
                                {
                                    "type": "cmd",
                                    "command": "worldStateManager",
                                    "args": [
                                        {
                                            "arg": "storeIn",
                                            "type": "name",
                                            "value": invariant["participant"],
                                        },
                                        {
                                            "arg": "cmd",
                                            "type": "string",
                                            "value": "getValue",
                                        },
                                        {
                                            "arg": "participant",
                                            "type": "string",
                                            "value": `${invariant["participant"]}`,
                                        },
                                        {
                                            "arg": "type",
                                            "type": "string",
                                            "value": "",
                                        },
                                        {
                                            "arg": "role",
                                            "type": "string",
                                            "value": "",
                                        },
                                    ],
                                },
                                {
                                    "type": "registeredCmd",
                                    "command": "_callIfExist",
                                    "args": [
                                        {
                                            "arg": null,
                                            "type": "string",
                                            "value": "inv_result",
                                        },
                                        {
                                            "arg": null,
                                            "type": "string",
                                            "value": invCmd,
                                        },
                                        {
                                            "arg": null,
                                            "type": "name",
                                            "value": invariant["participant"],
                                        },
                                    ],
                                },
                                {
                                    "type": "if",
                                    "args": [
                                        {
                                            "arg": null,
                                            "type": "name",
                                            "value": "inv_result",
                                        },
                                    ],
                                    "body": [{
                                        "type": "cmd",
                                        "command": "display",
                                        "args": [
                                            {
                                                "arg": null,
                                                "type": "string",
                                                "value": invViolationMessage,
                                            },
                                        ],
                                    }],
                                },
                            ],
                        };
                        child.body.splice(child.body.length - 1, 0, invariantBlock);
                    };
                } else {
                    this.addInvariants(child);
                }
            }
        }
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

        if (!currBehavior || !targetBehavior) {
            console.warn("Behavior not found");
            return;
        }

        if (path.includes(startBehavior)) {
            path.push(startBehavior);
            // console.log("Looped Path:");
            // console.log([...path]);
            return path;
        } else if (startBehavior === endBehavior) {
            path.push(startBehavior);
            console.log("Valid Path from create to transform:");
            console.log([...path]);
            return path;
        }

        path.push(startBehavior);
        if (currBehavior.nextBehaviors.length > 1) {
            for (const next of currBehavior.nextBehaviors) {
                this.walkPath(next, endBehavior, [...path]);
            }
        } else if (currBehavior.nextBehaviors.length === 1) {
            this.walkPath(currBehavior.nextBehaviors[0], endBehavior, [...path]);
        }
    }
}
