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
    if (!this.client) {
      throw new Error('Twilio client not initialized. Check your credentials.');
    }

    try {
      // Asegurar formato del número (debe incluir código de país)
      let phoneNumber = to;
      if (!phoneNumber.startsWith('+')) {
        // Si el número no tiene +, asumimos que es colombiano
        phoneNumber = `+57${phoneNumber}`;
      }

      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      this.logger.log(`SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`);
      
      return {
        success: true,
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Error sending SMS to ${to}:`, error);
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

