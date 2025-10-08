/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { DisburserService } from './disburser.service';
import { CreditService } from '../credit/credit.service';
import { GetCredit, UpdateCreditsDto } from '../credit/dto/update-credit.dto';
export declare class DisburserController {
    private readonly disburserService;
    private readonly creditService;
    constructor(disburserService: DisburserService, creditService: CreditService);
    getAllCredits(body: GetCredit): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("../credit/entities/credit.entity").Credit> & import("../credit/entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, import("../credit/entities/credit.entity").Credit> & import("../credit/entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("../credit/entities/credit.entity").Credit, "find">;
    updateCredit(body: UpdateCreditsDto): Promise<import("mongoose").Document<unknown, {}, import("../credit/entities/credit.entity").Credit> & import("../credit/entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
