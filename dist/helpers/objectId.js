"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectId = void 0;
const mongoose_1 = require("mongoose");
function ObjectId(id) {
    return new mongoose_1.Types.ObjectId(id);
}
exports.ObjectId = ObjectId;
//# sourceMappingURL=objectId.js.map