"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareRunIdForAzureTables = void 0;
exports.prepareRunIdForAzureTables = (runId) => {
    const find = "/";
    const re = new RegExp(find, "g");
    return runId.replace(re, "");
};
exports.default = exports.prepareRunIdForAzureTables;
//# sourceMappingURL=prepare-run-id-for-azure-tables.js.map