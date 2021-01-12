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
const azure = require("azure-storage");
const uuid_1 = require("uuid");
class WorkflowService {
    constructor() {
        this.tableService = azure.createTableService(process.env.AzureWebJobsStorage);
        this.workflowRunsTable = "workflowRuns";
        this.workflowRunsDataTable = "workflowRunsData";
    }
    _generateWorkflowRunEntityData(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const countWorkflows = yield this._countWorkflowRunsInTable(body.workflowState.workflowId);
            const workflowRun = {
                PartitionKey: { _: body.workflowState.workflowId, $: "Edm.String" },
                RowKey: { _: uuid_1.v4(), $: "Edm.String" },
                RunId: { _: body.workflowState.runId, $: "Edm.String" },
                RunName: {
                    _: `${body.workflowState.name}_Run_${countWorkflows + 1}`,
                    $: "Edm.String",
                },
                HTML: { _: body.appState.html, $: "Edm.String" },
                Subject: { _: body.appState.subject, $: "Edm.String" },
                Executor: { _: body.appState.executor, $: "Edm.String" },
                Status: { _: "In Progress", $: "Edm.String" },
                ReportId: { _: "Not created", $: "Edm.String" },
            };
            return workflowRun;
        });
    }
    _generateWorkflowRunDataEntityData(body, response) {
        const workflowRunData = {
            PartitionKey: { _: body.workflowState.runId, $: "Edm.String" },
            RowKey: { _: uuid_1.v4(), $: "Edm.String" },
            Email: { _: response.email, $: "Edm.String" },
            FirstName: { _: response.firstName, $: "Edm.String" },
            LastName: { _: response.lastName, $: "Edm.String" },
            Status: { _: response.statusCode, $: "Edm.Int32" },
        };
        return workflowRunData;
    }
    _createTableIfNotExist(tableName) {
        return new Promise((resolve, reject) => {
            this.tableService.createTableIfNotExists(tableName, function (error, result, response) {
                if (!error) {
                    resolve(result);
                }
                reject(error);
            });
        });
    }
    _insertEntity(tableName, entity) {
        return new Promise((resolve, reject) => {
            this.tableService.insertEntity(tableName, entity, { echoContent: true }, function (error, result, response) {
                if (!error) {
                    resolve(result);
                }
                reject(error);
            });
        });
    }
    _insertOrMergeEntity(tableName, entity) {
        return new Promise((resolve, reject) => {
            this.tableService.insertOrMergeEntity(tableName, entity, function (error, result, response) {
                if (!error) {
                    resolve(result);
                }
                reject(error);
            });
        });
    }
    _retrieveEntity(tableName, partitionKey, rowKey) {
        return new Promise((resolve, reject) => {
            this.tableService.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, _response) {
                if (!error) {
                    resolve(result);
                }
                else if (error.statusCode == 404) {
                    resolve(null);
                }
                reject(error);
            });
        });
    }
    _retrieveEntitiesByPartition(tableName, partitionKey) {
        return new Promise((resolve, reject) => {
            const query = new azure.TableQuery().where("PartitionKey eq ?", partitionKey);
            this.tableService.queryEntities(tableName, query, null, function (error, result, response) {
                if (!error) {
                    resolve(result);
                }
                reject(error);
            });
        });
    }
    _retrieveEntitiesByQuery(tableName, query) {
        return new Promise((resolve, reject) => {
            this.tableService.queryEntities(tableName, query, null, function (error, result, response) {
                if (!error) {
                    resolve(result);
                }
                reject(error);
            });
        });
    }
    _countWorkflowRunsInTable(partitionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflowRuns = yield this._retrieveEntitiesByPartition(this.workflowRunsTable, partitionName);
            const entries = workflowRuns.entries;
            return entries.length;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._createTableIfNotExist(this.workflowRunsTable);
            yield this._createTableIfNotExist(this.workflowRunsDataTable);
        });
    }
    createWorkflowRun(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflowRun = yield this._retrieveEntity(this.workflowRunsTable, body.workflowState.workflowId, body.workflowState.runId);
            if (!workflowRun) {
                yield this._createTableIfNotExist(this.workflowRunsTable);
                const data = yield this._generateWorkflowRunEntityData(body);
                const workflowRunEntity = yield this._insertEntity(this.workflowRunsTable, data);
                return workflowRunEntity;
            }
            else {
                throw new Error("Workflow is already in DB");
            }
        });
    }
    createWorkflowRunData(body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._createTableIfNotExist(this.workflowRunsDataTable);
            const workflowRunEntities = yield Promise.all(body.emailResponses.map((response) => __awaiter(this, void 0, void 0, function* () {
                const data = this._generateWorkflowRunDataEntityData(body, response);
                const workflowRunEntity = yield this._insertEntity(this.workflowRunsDataTable, data);
                return workflowRunEntity;
            })));
            return workflowRunEntities;
        });
    }
    updateWorkflowReport(workflowRun, report) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedWorkflowRun = Object.assign(Object.assign({}, workflowRun), { ReportId: { _: report.id, $: "Edm.String" } });
            yield this._insertOrMergeEntity(this.workflowRunsTable, updatedWorkflowRun);
            return updatedWorkflowRun;
        });
    }
    updateWorkflowStatus(workflowRun, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedWorkflowRun = Object.assign(Object.assign({}, workflowRun), { Status: { _: status, $: "Edm.String" } });
            yield this._insertOrMergeEntity(this.workflowRunsTable, updatedWorkflowRun);
            return updatedWorkflowRun;
        });
    }
    getWorkflowRunById(runId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new azure.TableQuery().where("RunId eq ?", runId);
            const result = yield this._retrieveEntitiesByQuery(this.workflowRunsTable, query);
            const workflowRun = result.entries[0];
            return workflowRun;
        });
    }
    getWorkflowRunDataById(runId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._retrieveEntitiesByPartition(this.workflowRunsDataTable, runId);
            return result.entries;
        });
    }
    getWorkflowRunsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._retrieveEntitiesByPartition(this.workflowRunsTable, id);
            return result.entries;
        });
    }
}
exports.default = WorkflowService;
//# sourceMappingURL=workflow.service.js.map