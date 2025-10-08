export declare class UpdateUserDto {
    email: string;
    name: string;
    secondName: string;
    lastname: string;
    secondLastname: string;
    phoneNumber: string;
    dateOfBirth: Date;
    documentType: string;
    documentNumber: string;
}
export declare class UpdateUserAdminDto extends UpdateUserDto {
    email: string;
    uid: string;
    role: string;
}
