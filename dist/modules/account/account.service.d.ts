export declare class AccountService {
    private readonly crypto;
    constructor();
    hashBankNumber(bankNumber: string): string;
    encryptBankNumber(bankNumber: string, encryptionKey: string): string;
    decryptBankNumber(encryptedBankNumber: string, encryptionKey: string): string;
}
