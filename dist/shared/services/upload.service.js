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
const multipart = require("parse-multipart");
const getStream = require("into-stream");
const uuid_1 = require("uuid");
class UploadService {
    constructor() {
        this.blobService = azure.createBlobService(process.env.AzureWebJobsStorage);
        this.imageContainer = "images";
        this.draftContainer = "drafts";
    }
    _createContainerIfNotExists(containerName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.blobService.createContainerIfNotExists(containerName, { publicAccessLevel: "blob" }, function (error, result, response) {
                    if (!error) {
                        resolve(result);
                    }
                    reject(error);
                });
            });
        });
    }
    _createBlockBlobFromStream(container, name, stream, streamLength) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.blobService.createBlockBlobFromStream(container, name, stream, streamLength, function (error, result, response) {
                    if (!error) {
                        resolve(result);
                    }
                    reject(error);
                });
            });
        });
    }
    _getBlobToText(container, blobName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.blobService.getBlobToText(container, blobName, function (error, result, response) {
                    if (!error) {
                        resolve(result);
                    }
                    reject(error);
                });
            });
        });
    }
    _createBlockBlobFromText(container, name, text) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.blobService.createBlockBlobFromText(container, name, text, function (error, result, response) {
                    if (!error) {
                        resolve(result);
                    }
                    reject(error);
                });
            });
        });
    }
    parseImageFromMultipart(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const bodyBuffer = Buffer.from(req.body);
            const boundary = multipart.getBoundary(req.headers["content-type"]);
            const parts = multipart.Parse(bodyBuffer, boundary);
            return parts[0];
        });
    }
    convertImageIntoReadableStream(image) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = image.filename;
            const stream = getStream(image.data);
            const length = image.data.length;
            const imageStream = {
                name,
                stream,
                length,
            };
            return imageStream;
        });
    }
    uploadImageAsStream(imageStreamData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._createContainerIfNotExists(this.imageContainer);
            const result = yield this._createBlockBlobFromStream(this.imageContainer, `${uuid_1.v4()}.png`, imageStreamData.stream, imageStreamData.length);
            return result;
        });
    }
    getImageUrl(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.blobService.getUrl(this.imageContainer, name);
        });
    }
    uploadJSONAsText(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._createContainerIfNotExists(this.draftContainer);
            const blob = yield this._createBlockBlobFromText(this.draftContainer, `${data.name}.json`, JSON.stringify(data.json));
            return blob;
        });
    }
    getTextData(blobName) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._getBlobToText(this.draftContainer, blobName);
            return data;
        });
    }
    parseJSONReqData(req) {
        const { workflowId } = req.params;
        const data = {
            name: workflowId,
            json: req.body,
        };
        return data;
    }
}
exports.default = UploadService;
//# sourceMappingURL=upload.service.js.map