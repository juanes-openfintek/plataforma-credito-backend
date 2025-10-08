"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");
const decorators_1 = require("../auth/decorators");
let FilesService = class FilesService {
    async uploadFile(file) {
        const bucket = admin.storage().bucket();
        const tempFilePath = path.join(os.tmpdir(), file.originalname);
        const stream = fs.createWriteStream(tempFilePath);
        stream.write(file.buffer);
        stream.end();
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        await bucket.upload(tempFilePath, {
            destination: file.originalname,
        });
        fs.unlinkSync(tempFilePath);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${file.originalname}?alt=media`;
        return publicUrl;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    (0, decorators_1.Auth)()
], FilesService);
//# sourceMappingURL=files.service.js.map