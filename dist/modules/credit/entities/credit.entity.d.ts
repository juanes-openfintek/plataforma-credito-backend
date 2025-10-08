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
import { HydratedDocument, Model, Types } from 'mongoose';
import { User } from '../../../modules/auth/entities/user.entity';
import { Taxes } from '../../../modules/taxes/entities/taxes.entity';
export type UserDocument = HydratedDocument<Credit>;
export declare class Credit {
    status: string;
    code: number;
    details: string;
    user: User;
    taxes: Taxes;
    name: string;
    secondName: string;
    lastname: string;
    secondLastname: string;
    phoneNumber: string;
    dateOfBirth: Date;
    documentType: string;
    documentNumber: string;
    economicActivity: string;
    nameCompany: string;
    phoneNumberCompany: string;
    addressCompany: string;
    positionCompany: string;
    dateOfAdmission: Date;
    monthlyIncome: string;
    monthlyExpenses: string;
    experienceCredit: string;
    disburserMethod: string;
    nameReferencePersonal: string;
    parentescoReferencePersonal: string;
    phoneNumberReferencePersonal: string;
    departamentReferencePersonal: string;
    municipalityReferencePersonal: string;
}
export declare const CreditSchema: import("mongoose").Schema<Credit, Model<Credit, any, any, any, import("mongoose").Document<unknown, any, Credit> & Credit & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Credit, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Credit>> & import("mongoose").FlatRecord<Credit> & {
    _id: Types.ObjectId;
}>;
