import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class AccountService {
  private readonly crypto;

  constructor() {
    this.crypto = crypto;
  }

  public hashBankNumber(bankNumber: string): string {
    // Genera un hash seguro utilizando la función hash criptográfica SHA-256
    const hash = this.crypto
      .createHash('sha256')
      .update(bankNumber)
      .digest('hex');
    return hash;
  }

  public encryptBankNumber(bankNumber: string, encryptionKey: string): string {
    const cipher = this.crypto.createCipher('aes-256-cbc', encryptionKey);
    let encrypted = cipher.update(bankNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  public decryptBankNumber(
    encryptedBankNumber: string,
    encryptionKey: string,
  ): string {
    const decipher = this.crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(encryptedBankNumber, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
