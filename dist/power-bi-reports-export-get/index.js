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
const powerbi_service_1 = require("../shared/services/powerbi.service");
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const reportId = context.req.params.reportId;
        try {
            const powerBIServiceAuthData = yield get_access_token_1.getAccessToken();
            const powerBIScv = new powerbi_service_1.default(powerBIServiceAuthData);
            const result = yield powerBIScv.exportReportById(reportId);
            console.log(result);
            context.res.status(200).json(result);
        }
        catch (err) {
            context.res.status(400).json({
                err: err.message,
            });
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map