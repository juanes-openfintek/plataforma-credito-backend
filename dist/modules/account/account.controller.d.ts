import { AccountService } from './account.service';
export declare class AccountController {
    private readonly accountService;
    constructor(accountService: AccountService);
    hashBankNumber(bankNumber: string): {
        hashedBankNumber: string;
    };
    encryptBankNumber(bankNumber: string): {
        encryptedBankNumber: string;
    };
    decryptBankNumber(encryptedBankNumber: string): {
        decryptedBankNumber: string;
    };
}
