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
            let isGet = false;
            let isAdd = false;
            let name = null;
            let role = null;
            for (const t of worldStateTransformArgs) {
                const isTransform = (t.arg === "transformation");
                isCreate = (isTransform && t.value === "create")?true:isCreate;
                isGet = (isTransform && (t.value === "get" || t.value === "getValue"))?true:isGet;
                isAdd = (isTransform && (t.value === "update"))?true:isAdd;
                name = (t.arg === "name")?t.value:name;
                role = (t.arg === "p_role")?t.value:role;
            }
            if (isCreate) {
                this.created.push({name: name, role: role, behavior: this.currentBehavior.name});
                this.currentBehavior["updatedParticipants"].push({name: name, role: role});
            }
            if (isGet) {
                this.currentBehavior["accessedParticipants"].push({name: name, role: role});
            }
            if (isAdd) {
                this.currentBehavior["updatedParticipants"].push({name: name, role: role});
            }
        });
    }

    /**
     * Geneates all unique combinations from list of values:
     * ["a","b","c"]
     * ->
     * ("a"),("a","b"),("a","b","c"),("a","c"),("b")("b","c"),("c")
     *
     * @param {Array} names Array of names.
     * @return {Object} Combinations
     */
    generateCombinations (names) {
        const combinations = [];

        /**
         * Generates all the possible combinations by visiting
         * each node in the list and then recursively walking
         * each unique branch while accumulating the possible
         * combinations.
         *
         * @param {Number} start Starting position in list
         * @param {Number} current Current accumulated list
         */
        function generate (start, current) {
            for (let i = start; i < names.length; i++) {
                const combination = current.concat({
                    index: i + 1,
                    name: names[i],
                });

                combinations.push(combination);

                generate(i + 1, combination);
            }
        }

        generate(0, []);
        return combinations;
    }

    /**
     * Identifies the provenance of the participants involved in
     * each transformation in a behavior.
     */
    identifyProvenance () {
        for (const behavior of this.behaviors) {
            console.log("");
            console.log(`Behavior:${behavior.name}`);
            for (const transformation of behavior.transformations) {
                console.log(`Transformation:${transformation.command}`);

                // Save the names.
                const names = [];
                for (const p of transformation.participants) {
                    if (p.type !== "name") continue;
                    names.push(p.value);
                }

                for (const [index, p] of transformation.participants.entries()) {
                    const _p = {};
                    // If participant is not type name
                    if (p.type !== "name") continue;

                    _p[p.value] = {};

                    // Find role and save role in transformation participant
                    const name = p.value;
                    const pMeta = behavior["accessedParticipants"].find((p) => p.name == name);
                    if (!pMeta) continue;
                    p.role = pMeta.role;

                    // Find where the role was created
                    p.provenanceBehavior = this.created.find((v) => v.role == pMeta.role)?.behavior;

                    // Find all the valid paths from creation to trasformation
                    this.validPaths = [];
                    const sB = p.provenanceBehavior;
                    const tB = behavior.name;
                    this.walkPath(sB, tB, []);
                    // console.log(`From ${sB} to ${tB}: ${this.validPaths}`);


                    /**
                     * For each path, save the node in which each participant
                     * was updated. This will be used to place the invariants
                     * (or combination of invaraints).
                     */
                    for (const [pathIndex, path] of this.validPaths.entries()) {
                        _p[p.value][pathIndex] = [];
                        for (let i = path.length - 1; i >= 0; i--) {
                            if (path[i] === tB) continue;
                            const b = this.getBehavior(path[i]);
                            for (const [pIndex, name] of names.entries()) {
                                if (b.updatedParticipants.find((v) => v.name === name)) {
                                    const val = {
                                        participant: name,
                                        path: pathIndex,
                                        pathPosition: i,
                                        behavior: path[i],
                                        transformBehavior: tB,
                                        transformation: transformation.command,
                                        index: pIndex + 1,
                                    };
                                    _p[p.value][pathIndex].push(val);
                                }
                            }
                        }
                    }

                    console.log(_p);

                    const combinations = this.generateCombinations(names);

                    for (const combination of combinations) {
                        let indexStr = "";
                        const _participants = [];
                        for (const [index, entry] of combination.entries()) {
                            indexStr += ((combination[index].index).toString() + "_");
                            _participants.push(combination[index].name);
                        }
                        indexStr = indexStr.slice(0, -1);

                        for (const name of Object.keys(_p)) {
                            for (const [index, uniquePath] of Object.entries(_p[name])) {
                                for (let i = uniquePath.length - 1; i >= 0; i--) {
                                    const entry = uniquePath[i];

                                    if (combination.find((val) => val.name === entry.participant)) {
                                        // Check if invariant already exists
                                        const invExists = this.invariants.find((val) => {
                                            if (val.behavior === entry.behavior &&
                                                val.transformation === entry.transformation &&
                                                val.transformBehavior === entry.transformBehavior &&
                                                val.index === indexStr) {
                                                return true;
                                            }
                                        });
                                        if (invExists) continue;

                                        // Add invariant
                                        this.invariants.push({
                                            path: entry.index,
                                            pathPosition: entry.pathPosition,
                                            behavior: entry.behavior,
                                            transformBehavior: entry.transformBehavior,
                                            transformation: entry.transformation,
                                            participants: _participants,
                                            index: indexStr,
                                        });
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            };
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

                        const invViolationMessage = "f'Invariant Violation: " + invCmd + " for " +
                            invariant["participants"].toString() + " in transformation " +
                            invariant["transformation"] + " in behavior " +
                            invariant["transformBehavior"] + "'";

                        // Has participants
                        const hasParticipants = {
                            "type": "cmd",
                            "command": "worldStateManager",
                            "args": [
                                {
                                    "arg": "storeIn",
                                    "type": "name",
                                    "value": "hasParticipants",
                                },
                                {
                                    "arg": "cmd",
                                    "type": "string",
                                    "value": "hasParticipants",
                                },
                                {
                                    "arg": "participant",
                                    "type": "list",
                                    "value": invariant.participants,
                                },
                            ],
                        };

                        const callInv = {
                            "type": "registeredCmd",
                            "command": "_callIfExist",
                            "args": [
                                {
                                    "arg": null,
                                    "type": "string",
                                    "value": "invariantViolated",
                                },
                                {
                                    "arg": null,
                                    "type": "string",
                                    "value": invCmd,
                                }].concat(invariant.participants.map((inv) => {
                                return {
                                    "arg": null,
                                    "type": "name",
                                    "value": inv,
                                };
                            })),
                        };

                        // Get participant values
                        const getParticipants = invariant.participants.map((name) => {
                            return this.getWorldStateParticipantAST("getValue", name, name);
                        });

                        // If participants exist
                        const ifInvariantViolated = {
                            "type": "if",
                            "args": [
                                {
                                    "arg": null,
                                    "type": "name",
                                    "value": "invariantViolated",
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
                        };

                        // If participants exist
                        const ifParticipantsExist = {
                            "type": "if",
                            "args": [
                                {
                                    "arg": null,
                                    "type": "name",
                                    "value": "hasParticipants",
                                },
                            ],
                            "body": [...getParticipants, callInv, ifInvariantViolated]
                        };


                        const body = [hasParticipants, ifParticipantsExist];

                        const invariantBlock = {
                            "type": "invariant",
                            "args": [],
                            "body": body,
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
     * Returns the participant args AST.
     * @param {String} cmd
     * @param {String} storeP
     * @param {String} p
     * @return {Object}
     */
    getWorldStateParticipantAST (cmd, storeP, p) {
        return {
            "type": "cmd",
            "command": "worldStateManager",
            "args": [
                {
                    "arg": "storeIn",
                    "type": "name",
                    "value": storeP,
                },
                {
                    "arg": "cmd",
                    "type": "string",
                    "value": cmd,
                },
                {
                    "arg": "participant",
                    "type": "string",
                    "value": `${p}`,
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
        };
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
