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
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { User } from '../../modules/auth/entities/user.entity';
export declare class CreditController {
    private readonly creditService;
    constructor(creditService: CreditService);
    create(createCreditDto: CreateCreditDto, user: User): Promise<import("mongoose").Document<unknown, {}, import("./entities/credit.entity").Credit> & import("./entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createWithoutUser(createCreditDto: CreateCreditDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/credit.entity").Credit> & import("./entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getCreditsByUser(user: User): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("./entities/credit.entity").Credit> & import("./entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, import("./entities/credit.entity").Credit> & import("./entities/credit.entity").Credit & {
        _id: import("mongoose").Types.ObjectId;
    }, {}, import("./entities/credit.entity").Credit, "find">;
}
