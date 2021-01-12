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
const node_fetch_1 = require("node-fetch");
class PowerBIService {
    constructor(authToken) {
        this.IN_GROUP_API_LINK = `https://api.powerbi.com/v1.0/myorg/groups/${process.env.PBIEGroupID}/`;
        this.AUTH_DATA = authToken;
    }
    _getRequestHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenResponse;
            try {
                tokenResponse = this.AUTH_DATA;
                const token = tokenResponse.accessToken;
                return {
                    "Content-Type": "application/json",
                    Authorization: "Bearer ".concat(token),
                };
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    _generatePushDatasetRows(workflowRunArr) {
        const rows = workflowRunArr.map((workflowRun) => {
            return {
                date: workflowRun.Timestamp._,
                email: workflowRun.Email._,
                status: workflowRun.Status._ == 200 ? "Successful" : "Failed",
            };
        });
        return {
            rows,
        };
    }
    _getBaseReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const reportsApi = `${this.IN_GROUP_API_LINK}/reports`;
            const headers = yield this._getRequestHeader();
            const data = yield node_fetch_1.default(reportsApi, {
                method: "GET",
                headers: headers,
            });
            const result = yield data.json();
            const reportsArray = result.value;
            const baseReport = reportsArray.find((report) => report.name === "_BASE_");
            return baseReport;
        });
    }
    createPushDataset(datasetName) {
        return __awaiter(this, void 0, void 0, function* () {
            const datasetsApi = `${this.IN_GROUP_API_LINK}/datasets`;
            const headers = yield this._getRequestHeader();
            const formData = {
                name: datasetName,
                defaultMode: "Push",
                tables: [
                    {
                        name: "RealTimeData",
                        columns: [
                            {
                                name: "status",
                                dataType: "string",
                            },
                            {
                                name: "email",
                                dataType: "string",
                            },
                            {
                                name: "date",
                                dataType: "DateTime",
                            },
                        ],
                    },
                ],
            };
            const data = yield node_fetch_1.default(datasetsApi, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(formData),
            });
            const result = yield data.json();
            return result;
        });
    }
    postRowsPushDatasetInGroup(dataset, workflowRunData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pushDatasetApi = `${this.IN_GROUP_API_LINK}/datasets/${dataset.id}/tables/RealTimeData/rows`;
            const headers = yield this._getRequestHeader();
            const rows = this._generatePushDatasetRows(workflowRunData);
            const data = yield node_fetch_1.default(pushDatasetApi, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(rows),
            });
            return data.status;
        });
    }
    cloneBaseReport(reportName, dataset) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseReport = yield this._getBaseReport();
            const cloneReportApi = `${this.IN_GROUP_API_LINK}/reports/${baseReport.id}/Clone`;
            const headers = yield this._getRequestHeader();
            const formData = {
                name: reportName,
                targetModelId: dataset.id,
                targetWorkspaceId: process.env.PBIEGroupID,
            };
            const data = yield node_fetch_1.default(cloneReportApi, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(formData),
            });
            const report = yield data.json();
            return report;
        });
    }
    _getReportById(reportId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportsApi = `${this.IN_GROUP_API_LINK}/reports/${reportId}`;
            const headers = yield this._getRequestHeader();
            const result = yield node_fetch_1.default(reportsApi, {
                method: "GET",
                headers: headers,
            });
            const report = yield result.json();
            return report;
        });
    }
    _generateReportToken(reportId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenApi = `${this.IN_GROUP_API_LINK}/reports/${reportId}/GenerateToken`;
            const headers = yield this._getRequestHeader();
            const result = yield node_fetch_1.default(tokenApi, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ accessLevel: "View" }),
            });
            const tokenData = yield result.json();
            return tokenData;
        });
    }
    generateEmbeddedData(reportId) {
        return __awaiter(this, void 0, void 0, function* () {
            const report = yield this._getReportById(reportId);
            const token = yield this._generateReportToken(reportId);
            return {
                reportId: report.id,
                embedUrl: report.embedUrl,
                accessToken: token.token,
                expiration: token.expiration,
            };
        });
    }
}
exports.default = PowerBIService;
//# sourceMappingURL=powerbi.service.js.map