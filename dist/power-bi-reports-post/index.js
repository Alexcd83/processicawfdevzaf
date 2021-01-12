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
const get_access_token_1 = require("../shared/helpers/get-access-token");
const prepare_run_id_for_azure_tables_1 = require("../shared/helpers/prepare-run-id-for-azure-tables");
const powerbi_service_1 = require("../shared/services/powerbi.service");
const workflow_service_1 = require("../shared/services/workflow.service");
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const runId = prepare_run_id_for_azure_tables_1.default(req.body.runId);
        try {
            const powerBIServiceAuthData = yield get_access_token_1.getAccessToken();
            const powerBIScv = new powerbi_service_1.default(powerBIServiceAuthData);
            const workflowSvc = new workflow_service_1.default();
            yield workflowSvc.init();
            const workflowRun = yield workflowSvc.getWorkflowRunById(runId);
            yield workflowSvc.updateWorkflowStatus(workflowRun, "Generating report");
            if (!workflowRun) {
                context.res.status(404).send();
            }
            const workflowRunData = yield workflowSvc.getWorkflowRunDataById(runId);
            const dataset = yield powerBIScv.createPushDataset(workflowRun.RunName._);
            const status = yield powerBIScv.postRowsPushDatasetInGroup(dataset, workflowRunData);
            if (status == 200) {
                const report = yield powerBIScv.cloneBaseReport(workflowRun.RunName._, dataset);
                const workflowRunWithReport = yield workflowSvc.updateWorkflowReport(workflowRun, report);
                yield workflowSvc.updateWorkflowStatus(workflowRunWithReport, "Successfully completed with a ready-made report");
            }
            context.res.status(201).send();
        }
        catch (err) {
            context.res.status(500).json({
                err: err.message,
            });
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map