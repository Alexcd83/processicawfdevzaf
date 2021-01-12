"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prepare_data_for_azure_tables_1 = require("../shared/helpers/prepare-data-for-azure-tables");
const workflow_service_1 = require("../shared/services/workflow.service");
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        const modifiedData = prepare_data_for_azure_tables_1.default(data);
        try {
            const workflowSvc = new workflow_service_1.default();
            yield workflowSvc.init();
            const workflowRun = yield workflowSvc.createWorkflowRun(modifiedData);
            yield workflowSvc.createWorkflowRunData(modifiedData);
            yield workflowSvc.updateWorkflowStatus(workflowRun, "Successfully processed and saved");
            context.res.status(201).send();
        }
        catch (err) {
            context.res.status(409).json({
                err: err.message,
            });
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map