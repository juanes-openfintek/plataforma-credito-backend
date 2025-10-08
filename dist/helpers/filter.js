"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFilterObject = void 0;
const mongoose_1 = require("mongoose");
const array_1 = require("./array");
function createFilterObject(filters, fileldsId = []) {
    return (0, array_1.isValidArray)(filters)
        ? filters.reduce((acc, cur) => {
            if (!cur?.field || !cur?.value)
                return acc;
            if (fileldsId.includes(cur.field)) {
                acc[cur.field] = new mongoose_1.Types.ObjectId(cur.value);
            }
            else {
                acc[cur.field] = {
                    $regex: cur.value ?? '',
                    $options: 'i',
                };
            }
            return acc;
        }, {})
        : {};
}
exports.createFilterObject = createFilterObject;
//# sourceMappingURL=filter.js.map