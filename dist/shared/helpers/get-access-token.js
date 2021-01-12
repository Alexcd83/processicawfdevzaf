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
exports.getAccessToken = void 0;
exports.getAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const adal = require("adal-node");
        const authorityUrl = "https://login.windows.net/common/oauth2/authorize/".replace("common", process.env.PBIETenantID);
        const scope = "https://analysis.windows.net/powerbi/api";
        const AuthenticationContext = adal.AuthenticationContext;
        const context = new AuthenticationContext(authorityUrl);
        return new Promise((resolve, reject) => {
            context.acquireTokenWithClientCredentials(scope, process.env.PBIEClientID, process.env.PBIESecret, function (err, tokenResponse) {
                // Function returns error object in tokenResponse
                // Invalid Username will return empty tokenResponse, thus err is used
                if (err) {
                    console.log(tokenResponse);
                    reject(tokenResponse == null ? err : tokenResponse);
                }
                resolve(tokenResponse);
            });
        });
    });
};
//# sourceMappingURL=get-access-token.js.map