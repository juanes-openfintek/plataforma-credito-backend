import { Injectable, Logger } from '@nestjs/common';

interface OtpData {
  code: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStore: Map<string, OtpData> = new Map();
  
  // Configuración
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Generar código OTP de 4 dígitos
   */
  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Guardar OTP para un número de teléfono
   */
  saveOtp(phone: string, otp: string): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    this.otpStore.set(phone, {
      code: otp,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(`OTP saved for ${phone}. Expires at ${expiresAt.toISOString()}`);

    // Limpiar OTP expirado después del tiempo límite
    setTimeout(() => {
      this.otpStore.delete(phone);
      this.logger.log(`OTP for ${phone} expired and removed`);
    }, this.OTP_EXPIRY_MINUTES * 60 * 1000);
  }

  /**
   * Verificar OTP
   */
  verifyOtp(phone: string, providedOtp: string): boolean {
    const otpData = this.otpStore.get(phone);

    if (!otpData) {
      this.logger.warn(`No OTP found for ${phone}`);
      return false;
    }

    // Verificar si expiró
    if (new Date() > otpData.expiresAt) {
      this.logger.warn(`OTP for ${phone} has expired`);
      this.otpStore.delete(phone);
      return false;
    }

    // Verificar intentos
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      this.logger.warn(`Max attempts reached for ${phone}`);
      this.otpStore.delete(phone);
      return false;
    }

    // Incrementar intentos
    otpData.attempts++;

    // Verificar código
    if (otpData.code === providedOtp) {
      this.logger.log(`OTP verified successfully for ${phone}`);
      this.otpStore.delete(phone); // Eliminar después de verificar exitosamente
      return true;
    }

    this.logger.warn(`Invalid OTP provided for ${phone}. Attempt ${otpData.attempts}/${this.MAX_ATTEMPTS}`);
    return false;
  }

  /**
   * Obtener tiempo restante del OTP (en segundos)
   */
  getTimeRemaining(phone: string): number | null {
    const otpData = this.otpStore.get(phone);

    if (!otpData) {
      return null;
    }

    const now = new Date();
    const remaining = Math.floor((otpData.expiresAt.getTime() - now.getTime()) / 1000);

    return remaining > 0 ? remaining : 0;
  }

  /**
   * Obtener intentos restantes
   */
  getRemainingAttempts(phone: string): number {
    const otpData = this.otpStore.get(phone);

    if (!otpData) {
      return this.MAX_ATTEMPTS;
    }

    return Math.max(0, this.MAX_ATTEMPTS - otpData.attempts);
  }

  /**
   * Limpiar OTP (útil para testing o reset manual)
   */
  clearOtp(phone: string): void {
    this.otpStore.delete(phone);
    this.logger.log(`OTP cleared for ${phone}`);
  }
}

