import {DALEngine} from "dal-engine-core-js-lib-dev";

self.onmessage = (event) => {
    const {type, payload} = event.data;


    if (type === "RUN_TRANSFORMATION") {
        const engine = new DALEngine({
            name: "default",
            description: "Default engine",
        });

        // Create behavior
        const behavior = engine.createBehavior({
            name: payload.behaviorName,
            description: "A behavior for testing transformations",
        });

        try {
            behavior.setPreWorldState(payload.initialWorldState);
            behavior.setPostWorldState(payload.expectedPostWorldState);
            behavior.setScript(payload.script);
            behavior.setPrimitiveArgs(payload.initialArgs);
            const output = behavior.computeTransformations();

            /**
             * This is a temporary step as I move towards executig the design
             * using the synthesized behaviors.
             *
             * I am establishing a workflow that will synthesize the spec
             * for the behavior into a function. Then in the next step, I will
             * replace the computeTransformations method used above with
             * actually executing the synthesized behavior. This will require
             * changes to the way the design is executed.
             *
             * So the order of the changes will be:
             * 1. Initially, use the compute behavior button to generate
             *    the synthesis of behaviors (while also calling old compute
             *    transformations method).
             * 2. Add a workflow so that everytime the script changes, it is
             *    automatically synthesized into the behavior in the UI.
             * 3. Replace the design executable with the synthesized behavior.
             *
             * Anyway, I will do it incrementally. The next step after that is
             * to connect the design to the environment using the substrate.
             */
            output["output"]["synthPackage"] = behavior.generateSynthesisPackage();

            self.postMessage({
                type: "Success",
                payload: {
                    output,
                },
            });
        } catch (error) {
            self.postMessage({
                type: "Error",
                payload: {
                    error: error.message,
                },
            });
        }
    }
};
