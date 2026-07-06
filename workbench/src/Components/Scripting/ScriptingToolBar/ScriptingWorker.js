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
            name: "Test Behavior",
            description: "A behavior for testing transformations"
        });

        try {
            behavior.setPreWorldState(payload.initialWorldState);
            behavior.setPostWorldState(payload.expectedPostWorldState);
            behavior.setScript(payload.script);
            behavior.setPrimitiveArgs(payload.initialArgs);
            const output = behavior.computeTransformations();

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
