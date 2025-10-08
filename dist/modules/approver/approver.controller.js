"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproverController = void 0;
const common_1 = require("@nestjs/common");
const approver_service_1 = require("./approver.service");
const create_approver_dto_1 = require("./dto/create-approver.dto");
const update_approver_dto_1 = require("./dto/update-approver.dto");
const decorators_1 = require("../auth/decorators");
const interfaces_1 = require("../auth/interfaces");
let ApproverController = class ApproverController {
    constructor(approverService) {
        this.approverService = approverService;
    }
    create(createApproverDto) {
        return this.approverService.create(createApproverDto);
    }
    findAll() {
        return this.approverService.findAll();
    }
    findOne(id) {
        return this.approverService.findOne(+id);
    }
    update(id, updateApproverDto) {
        return this.approverService.update(+id, updateApproverDto);
    }
    remove(id) {
        return this.approverService.remove(+id);
    }
};
exports.ApproverController = ApproverController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_approver_dto_1.CreateApproverDto]),
    __metadata("design:returntype", void 0)
], ApproverController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApproverController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApproverController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_approver_dto_1.UpdateApproverDto]),
    __metadata("design:returntype", void 0)
], ApproverController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApproverController.prototype, "remove", null);
exports.ApproverController = ApproverController = __decorate([
    (0, common_1.Controller)('approver'),
    (0, decorators_1.Auth)(interfaces_1.ValidRoles.approver, interfaces_1.ValidRoles.admin),
    __metadata("design:paramtypes", [approver_service_1.ApproverService])
], ApproverController);
//# sourceMappingURL=approver.controller.js.map