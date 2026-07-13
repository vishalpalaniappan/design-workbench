// scripting slice selectors
export const selectScripts = (state) => state.scripting.scripts;
export const selectTransformOutput = (state) => state.scripting.transformOutput;
export const selectTransformOutputLog = (state) => state.scripting.transformOutputLog;
export const selectAddTransformOutputLog = (state) => state.scripting.addTransformOutputLog;
export const selectScriptingCounter = (state) => state.scripting.scriptingCounter;
export const selectScriptingBehaviorId = (state) => state.app.selectedBehavior;
