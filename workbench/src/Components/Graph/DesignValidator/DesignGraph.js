
/**
 * This class reprents a graph of the design. It will
 * accepts behaviors with the metadata from the AST
 * and will expose operations that can be performed
 * on the graph.
 * 
 * For example, find the provenance of a participant. I will
 * also provide a method to walk the design and as each
 * transformation is encountered, it can be processed to
 * identify the semantic validity and the invariants it reveals.
 */
export class DesignGraph {

    constructor () {
        this.behaviors = {};
        this.currBehavior;
    }

    /**
     * Adds a behavior to the design.
     * @param {Object} behavior Object containing design info.
     */
    addBehavior (behavior) {
        this.behaviors[behavior.name] = behavior;
    }

    /**
     * Adds a behavior to enter the design.
     * @param {String} behaviorName Name of behavior.
     */
    addEntryBehavior (behaviorName) {
        this.entryBehavoior = behaviorName;
    }

    /**
     * Simple visitor to start walking the design.
     * 
     * Visits each behavior starting from the
     * entry behavior and following the next
     * behavior that is selected.
     */
    visit () {
    }
}