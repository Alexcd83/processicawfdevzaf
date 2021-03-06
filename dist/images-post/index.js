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
const upload_service_1 = require("../shared/services/upload.service");
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadSvc = new upload_service_1.default();
        try {
            const image = yield uploadSvc.parseImageFromMultipart(req);
            const imageStream = yield uploadSvc.convertImageIntoReadableStream(image);
            const blob = yield uploadSvc.uploadImageAsStream(imageStream);
            const url = yield uploadSvc.getImageUrl(blob.name);
            context.res.status(200).send({
                url,
            });
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