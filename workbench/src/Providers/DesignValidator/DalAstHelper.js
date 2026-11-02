
/**
 * Given invariant metadta, this method generates
 * the invariant block that is injected into a
 * DAL AST.
 *
 * @param {Object} invariant
 * @return {Object} DAL Ast Node
 */
export const getInvariantBlock = (invariant) => {
    /**
     * This entire block is messy because I am constructing
     * the DAL ast to synthesize the relevant implementation
     *
     * TODO:
     * It will be much cleaner once I add methods in the
     * dal-ast-js package to generate nodes but I am adding
     * a todo to remind myself to organize the implementation
     * below into a more digestable format.
     *
     * The structure is:
     *
     * - Check if the participants exist
     * - If they exist
     *      - get participant values
     *      - call the invariant
     *      - if invariant violation
     *          - log it
     *
     * I am rendering the check for participants through the
     * world state manager. I am also logging the invariant
     * using the world state manager.
     */
    const invCmd = invariant["transformation"].slice(1) +
            "_invariant_" + invariant["index"];

    // Create invariant violation message
    const invViolationMessage = "f'Semantically invalid state: " + invCmd +
            " for " +
        invariant["participants"].map((t) => t.value).toString() +
        " in transformation " +
        invariant["transformation"] + " in behavior " +
        invariant["transformBehavior"] + "'";

    // Identify participants that need to be loaded from world state
    const validParticipants = [];
    invariant.participants.forEach((p) => {
        if (p.type === "name") {
            validParticipants.push(p.value);
        }
    });

    // Add node to check if the participants exist
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
                "value": validParticipants,
            },
        ],
    };

    // Add nodes to call the invariant evaluator
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
            },
        ].concat(invariant.participants.map((inv) => {
            return {
                "arg": null,
                "type": inv.type,
                "value": inv.value,
            };
        })),
    };

    // Add nodes to synthesize getting participant values
    const getParticipants = [];
    for (const entry of invariant.participants) {
        if (entry.type === "name") {
            getParticipants.push(
                getWorldStateParticipantAST(
                    "getValue",
                    entry.value,
                    entry.value
                )
            );
        }
    }

    // Add nodes to set the invariant violation
    const setInvariantViolation = {
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
                "value": "setInvariantViolation",
            },
            {
                "arg": "invariantName",
                "type": "string",
                "value": invCmd,
            },
            {
                "arg": "invartiantParticipant",
                "type": "string",
                "value": invariant["participants"].map(
                    (t) => t.value
                ).toString(),
            },
            {
                "arg": "protectedBehavior",
                "type": "string",
                "value": invariant.transformBehavior,
            },
        ],
    };

    // Create node if invariant is violated
    const ifInvariantViolated = {
        "type": "if",
        "args": [
            {
                "arg": null,
                "type": "name",
                "value": "invariantViolated",
            },
        ],
        "body": [
            {
                "type": "registeredCmd",
                "command": "_print",
                "args": [
                    {
                        "arg": null,
                        "type": "null",
                        "value": null,
                    },
                    {
                        "arg": null,
                        "type": "string",
                        "value": invViolationMessage,
                    },
                ],
            },
            setInvariantViolation,
        ],
    };

    // Create node if participant exists
    const ifParticipantsExist = {
        "type": "if",
        "args": [
            {
                "arg": null,
                "type": "name",
                "value": "hasParticipants",
            },
        ],
        "body": [...getParticipants, callInv, ifInvariantViolated],
    };

    // Return the invariant node
    return {
        "type": "invariant",
        "args": [],
        "body": [hasParticipants, ifParticipantsExist],
    };
};

/**
 * Returns the world state transformation AST node.
 *
 * @param {String} cmd
 * @param {String} storeP
 * @param {String} p
 * @return {Object}
 */
const getWorldStateParticipantAST = (cmd, storeP, p) => {
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
};
