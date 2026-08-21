/**
 * Behavior node in the DAL AST.
 */
class BehaviorNode {
    /**
     * Initialize the behavior node with the name.
     * @param {String} name Behavior Name
     */
    constructor (name) {
        this.name = name;
        this.createNode();
    }

    /**
     * Creates the AST Node.
     */
    createNode () {
        this.node = {
            "type": "behavior",
            "behaviorName": this.name,
            "body": [],
        };
    }
}

export default BehaviorNode;
