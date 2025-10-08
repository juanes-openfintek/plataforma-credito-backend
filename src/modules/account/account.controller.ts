import { Controller, Post, Body } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('hash')
  hashBankNumber(@Body('bankNumber') bankNumber: string) {
    const hashedBankNumber = this.accountService.hashBankNumber(bankNumber);
    return { hashedBankNumber };
  }

  @Post('encrypt')
  encryptBankNumber(@Body('bankNumber') bankNumber: string) {
    // Aquí debes proporcionar la clave de cifrado de manera segura
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedBankNumber = this.accountService.encryptBankNumber(
      bankNumber,
      encryptionKey,
    );
    return { encryptedBankNumber };
  }

  @Post('decrypt')
  decryptBankNumber(@Body('encryptedBankNumber') encryptedBankNumber: string) {
    // Aquí debes proporcionar la clave de cifrado de manera segura
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const decryptedBankNumber = this.accountService.decryptBankNumber(
      encryptedBankNumber,
      encryptionKey,
    );
    return { decryptedBankNumber };
  }
}
