"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareStateForAzureTables = void 0;
exports.prepareStateForAzureTables = (data) => {
    const find = "/";
    const re = new RegExp(find, "g");
    const newData = Object.assign(Object.assign({}, data), { workflowState: {
            workflowId: data.workflowState.workflowId.replace(re, ""),
            runId: data.workflowState.runId.replace(re, ""),
            name: data.workflowState.name,
        } });
    return newData;
};
exports.default = exports.prepareStateForAzureTables;
//# sourceMappingURL=prepare-data-for-azure-tables.js.map