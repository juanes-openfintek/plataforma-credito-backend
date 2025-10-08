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
/// <reference types="mongoose/types/inferschematype" />
import { CreateCreditDto } from './dto/create-credit.dto';
import { Credit } from './entities/credit.entity';
import { Model, Types } from 'mongoose';
import { UpdateCreditsDto } from './dto/update-credit.dto';
export declare class CreditService {
    private readonly creditModel;
    constructor(creditModel: Model<Credit>);
    create(user: Types.ObjectId, createCreditDto: CreateCreditDto): Promise<import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    }>;
    updateCredit(body: UpdateCreditsDto): Promise<import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    }>;
    createWithoutUser(createCreditDto: CreateCreditDto): Promise<import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    }>;
    getCreditsByUser(user: Types.ObjectId): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    }, {}, Credit, "find">;
    getAllCredits(body?: {}): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    })[], import("mongoose").Document<unknown, {}, Credit> & Credit & {
        _id: Types.ObjectId;
    }, {}, Credit, "find">;
    private handleDBError;
}
