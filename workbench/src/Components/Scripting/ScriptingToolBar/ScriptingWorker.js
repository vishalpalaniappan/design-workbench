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

            console.log(output);

            /**
             * TODO: Given a behavior, extend the engine to generate a package
             * that will be sent to the program synthesis tool to generate a
             * python function which implements the behavior thorugh the AST
             * mapping.
            */
            // const synthesisPackage = behavior.getSynthesisPackage();

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
