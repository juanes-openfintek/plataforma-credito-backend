import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured. SMS functionality will not work.');
      return;
    }

    try {
      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
    }
  }

  /**
   * Enviar SMS usando Twilio
   */
  async sendSMS(to: string, message: string): Promise<any> {
    // Modo demo para desarrollo
    const isDemoMode = process.env.TWILIO_DEMO_MODE === 'true';
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    // Formatear número
    let phoneNumber = to;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+57${phoneNumber}`;
    }

    // Validar que no se intente enviar al mismo número
    if (phoneNumber === twilioPhone) {
      const errorMsg = `Cannot send SMS to the same number as Twilio phone. From: ${twilioPhone}, To: ${phoneNumber}`;
      this.logger.error(errorMsg);
      
      // En modo demo, simular éxito y mostrar el código
      if (isDemoMode) {
        this.logger.warn('⚠️  DEMO MODE: Simulating SMS send');
        this.logger.log(`📱 SMS would be sent to: ${phoneNumber}`);
        this.logger.log(`📝 Message: ${message}`);
        
        return {
          success: true,
          sid: `DEMO-${Date.now()}`,
          status: 'demo',
          message: 'Demo mode - SMS not actually sent',
        };
      }
      
      throw new Error(errorMsg);
    }

    // Modo demo: simular envío sin usar Twilio
    if (isDemoMode) {
      this.logger.warn('⚠️  DEMO MODE: Simulating SMS send');
      this.logger.log(`📱 To: ${phoneNumber}`);
      this.logger.log(`📝 Message: ${message}`);
      
      return {
        success: true,
        sid: `DEMO-${Date.now()}`,
        status: 'demo',
        message: 'Demo mode - check backend console for OTP code',
      };
    }

    // Envío real con Twilio
    if (!this.client) {
      throw new Error('Twilio client not initialized. Check your credentials.');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: twilioPhone,
        to: phoneNumber,
      });

      this.logger.log(`SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`);
      
      return {
        success: true,
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error sending SMS to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Verificar estado de un mensaje enviado
   */
  async getMessageStatus(messageSid: string): Promise<any> {
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        sid: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      this.logger.error(`Error fetching message status:`, error);
      throw error;
    }
  }
}

