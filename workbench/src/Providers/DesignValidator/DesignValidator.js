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
     * was introduced into the world. This will be used to find the
     * paths from the creation to the transformation. The last time
     * the participant was updated will be used to place the invariant
     * because it will cause the world to become semantically invalid.
     *
     * There can be multiple paths taken, this approach will find those
     * paths and place the invariant in multiple points where semantic
     * invalidity can be reached.
     *
     * @param {Object} behavior Behavior Info
     */
    processBehavior () {
        this.currentBehavior["accessedParticipants"] = [];
        this.currentBehavior["updatedParticipants"] = [];
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
                this.currentBehavior["updatedParticipants"].push({name: name, role: role});
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

            // Saves all the participant that were updated.
            let isAdd = false;
            name = null;
            role = null;
            for (const t of worldStateTransformArgs) {
                const isTransformation = (t.arg === "transformation");
                const v = t.value;
                isAdd = (isTransformation && (v === "update"))?true:isAdd;
                name = (t.arg === "name")?t.value:name;
                role = (t.arg === "p_role")?t.value:role;
            }
            if (isAdd) {
                this.currentBehavior["updatedParticipants"].push({name: name, role: role});
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
                const invariants = [];
                for (const [index, p] of transformation.participants.entries()) {
                    // If participant is not type name or
                    // first entry (return value), skip
                    if (p.type !== "name") {
                        continue;
                    }

                    // Find participant role
                    const name = p.value;
                    const pMeta = behavior["accessedParticipants"].find((p) => p.name == name);
                    if (!pMeta) continue;

                    // Save the role in the transformation participant
                    p.role = pMeta.role;

                    // Find where the role was created
                    p.provenanceBehavior = this.created.find((v) => v.role == pMeta.role)?.behavior;

                    // Find all the valid paths from creation to trasformation
                    this.validPaths = [];
                    const sB = p.provenanceBehavior;
                    const tB = behavior.name;
                    console.log("");
                    console.log(`Finding path from ${sB} to ${tB}`);
                    this.walkPath(sB, tB, []);
                    console.log(this.validPaths);

                    /**
                     * Walk the path backward to find the behavior where
                     * the participant was last modified and add invariant.
                     */
                    for (let pathIndex = 0; pathIndex < this.validPaths.length; pathIndex++) {
                        const path = this.validPaths[pathIndex];
                        for (let i = path.length - 1; i >= 0; i--) {
                            if (path[i] === tB) continue;
                            const behavior = this.getBehavior(path[i]);
                            const p = behavior.updatedParticipants.find((value) => {
                                return value.name === name;
                            });
                            if (p) {
                                const exists = this.invariants.find((val) => {
                                    if (val.behavior === path[i] && val.participant === name) {
                                        return true;
                                    }
                                });
                                if (!exists) {
                                    const inv = {
                                        path: pathIndex,
                                        pathPosition: i,
                                        behavior: path[i],
                                        transformBehavior: tB,
                                        transformation: transformation.command,
                                        participant: name,
                                        index: index + 1,
                                    };
                                    this.invariants.push(inv);
                                }
                                break;
                            }
                        }
                    }
                }
                console.log(invariants);
                // const additionalInvariants = this.buildInvariants(invariants);
                // this.invariants = this.invariants.concat(invariants);
            });
            delete behavior.worldState;
        }
        console.log(this.invariants);
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

                        const invCmd = invariant["transformation"].slice(1) +
                             "_invariant_" + invariant["index"];

                        const invViolationMessage = "f'Invariant " + invCmd + " for " +
                            invariant["participant"] + " in transformation " +
                            invariant["transformation"] + " in behavior " +
                            invariant["transformBehavior"] + "'";

                        /**
                         * For the invariant block, initial approach:
                         * - Invariant at position 1
                         *      - find latest update path before transformation
                         *      - get value of arg 1
                         *      - command_invariant_1()
                         * - Invariant at position 2
                         *      - find latest update path before transformation
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
                         * the target is reached or a loop happens.
                         *
                         * In this case, the ambiguity is eliminated using
                         * the graph, it is expliclity identifying when the
                         * world can become semantically invalid.
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

        if (path.length > 100) {
            console.warn("Path wasn't closing, termianting");
            return path;
        } else if (startBehavior === endBehavior) {
            path.push(startBehavior);
            this.validPaths.push([...path]);
            return path;
        }

        path.push(startBehavior);
        if (currBehavior.nextBehaviors.length > 1) {
            for (const next of currBehavior.nextBehaviors) {
                if (!path.includes(next)) {
                    this.walkPath(next, endBehavior, [...path]);
                }
            }
        } else if (currBehavior.nextBehaviors.length === 1) {
            this.walkPath(currBehavior.nextBehaviors[0], endBehavior, [...path]);
        }
    }
}
