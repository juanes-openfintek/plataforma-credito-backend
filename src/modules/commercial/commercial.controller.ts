import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommercialService } from './commercial.service';
import { RegisterCommercialUserDto } from './dto/register-commercial.dto';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';
import { CreateSimulationDto, SaveSimulationDto } from './dto/create-simulation.dto';
import { GenerateOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/getUser.decorator';
import { ValidRoles } from '../auth/interfaces/validRoles.interface';
import { User } from '../auth/entities/user.entity';
import { SimulationService } from './services/simulation.service';
import { TwilioService } from './services/twilio.service';
import { OtpService } from './services/otp.service';

@Controller('commercial')
export class CommercialController {
  constructor(
    private readonly commercialService: CommercialService,
    private readonly simulationService: SimulationService,
    private readonly twilioService: TwilioService,
    private readonly otpService: OtpService,
  ) {}

  /**
   * Get or create commercial profile
   */
  @Get('profile')
  @Auth(ValidRoles.commercial)
  async getProfile(@GetUser() user: User) {
    return this.commercialService.getCommercialProfile(user.id);
  }

  /**
   * Update commercial profile
   */
  @Put('profile')
  @Auth(ValidRoles.commercial)
  async updateProfile(
    @GetUser() user: User,
    @Body() updateData: Partial<RegisterCommercialUserDto>,
  ) {
    return this.commercialService.updateCommercialProfile(user.id, updateData);
  }

  /**
   * Get commercial statistics and dashboard info
   */
  @Get('stats')
  @Auth(ValidRoles.commercial)
  async getStats(@GetUser() user: User) {
    return this.commercialService.getCommercialStats(user.id);
  }

  /**
   * Create a new cliente
   */
  @Post('clientes')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.CREATED)
  async createCliente(@GetUser() user: User, @Body() dto: CreateClienteDto) {
    return this.commercialService.createCliente(user.id, dto);
  }

  /**
   * Get all clientes for commercial user
   */
  @Get('clientes')
  @Auth(ValidRoles.commercial)
  async getClientes(@GetUser() user: User) {
    return this.commercialService.getClientesByCommercial(user.id);
  }

  /**
   * Get clientes by status
   */
  @Get('clientes/status/:status')
  @Auth(ValidRoles.commercial)
  async getClientesByStatus(@GetUser() user: User, @Param('status') status: string) {
    return this.commercialService.getClientesByStatus(user.id, status);
  }

  /**
   * Get a specific cliente
   */
  @Get('clientes/:clienteId')
  @Auth(ValidRoles.commercial)
  async getCliente(@GetUser() user: User, @Param('clienteId') clienteId: string) {
    return this.commercialService.getClienteById(user.id, clienteId);
  }

  /**
   * Update a cliente
   */
  @Patch('clientes/:clienteId')
  @Auth(ValidRoles.commercial)
  async updateCliente(
    @GetUser() user: User,
    @Param('clienteId') clienteId: string,
    @Body() updateData: UpdateClienteDto,
  ) {
    return this.commercialService.updateCliente(user.id, clienteId, updateData);
  }

  /**
   * Delete a cliente
   */
  @Delete('clientes/:clienteId')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCliente(@GetUser() user: User, @Param('clienteId') clienteId: string) {
    return this.commercialService.deleteCliente(user.id, clienteId);
  }

  /**
   * Admin endpoints
   */

  /**
   * Get all commercial users (Admin only)
   */
  @Get('admin/users')
  @Auth(ValidRoles.admin)
  async getAllCommercialUsers() {
    // This will be implemented in a separate method
    return { message: 'Get all commercial users endpoint' };
  }

  /**
   * Verify a commercial user (Admin only)
   */
  @Put('admin/users/:commercialUserId/verify')
  @Auth(ValidRoles.admin)
  async verifyCommercialUser(@Param('commercialUserId') commercialUserId: string) {
    // This will be implemented in a separate method
    return { message: 'Verify commercial user endpoint' };
  }

  /**
   * Get specific cliente (Admin can view all, Commercial can only view their own)
   */
  @Get('admin/clientes/:clienteId')
  @Auth(ValidRoles.admin)
  async getClienteAsAdmin(@Param('clienteId') clienteId: string) {
    // This will be implemented in a separate method
    return { message: 'Get cliente as admin endpoint' };
  }

  /**
   * OTP endpoints
   */

  /**
   * Generar y enviar código OTP por SMS
   */
  @Post('otp/generate')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.OK)
  async generateOtp(@Body() dto: GenerateOtpDto) {
    try {
      // Generar código OTP
      const otp = this.otpService.generateOtp();

      // Guardar OTP
      this.otpService.saveOtp(dto.phone, otp);

      // Enviar SMS
      await this.twilioService.sendSMS(
        dto.phone,
        `Tu código de verificación FeelPay es: ${otp}. Válido por 5 minutos.`,
      );

      return {
        success: true,
        message: 'Código OTP enviado exitosamente',
        expiresIn: 300, // 5 minutos en segundos
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al enviar código OTP',
        error: error.message,
      };
    }
  }

  /**
   * Verificar código OTP
   */
  @Post('otp/verify')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = this.otpService.verifyOtp(dto.phone, dto.otp);

    if (!isValid) {
      const remainingAttempts = this.otpService.getRemainingAttempts(dto.phone);
      return {
        success: false,
        message: remainingAttempts > 0 
          ? `Código inválido. Te quedan ${remainingAttempts} intentos.`
          : 'Código inválido o expirado. Solicita uno nuevo.',
        remainingAttempts,
      };
    }

    return {
      success: true,
      message: 'Código verificado exitosamente',
    };
  }

  /**
   * Obtener tiempo restante del OTP
   */
  @Get('otp/time-remaining/:phone')
  @Auth(ValidRoles.commercial)
  async getOtpTimeRemaining(@Param('phone') phone: string) {
    const timeRemaining = this.otpService.getTimeRemaining(phone);

    if (timeRemaining === null) {
      return {
        hasOtp: false,
        message: 'No hay código OTP activo para este teléfono',
      };
    }

    return {
      hasOtp: true,
      timeRemaining,
      canResend: timeRemaining <= 0,
    };
  }

  /**
   * Simulation endpoints
   */

  /**
   * Calculate credit simulation
   */
  @Post('simulations/calculate')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.OK)
  async calculateSimulation(
    @GetUser() user: User,
    @Body() dto: CreateSimulationDto,
  ) {
    return this.simulationService.calculateSimulation(user.id, dto);
  }

  /**
   * Save a simulation
   */
  @Post('simulations')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.CREATED)
  async saveSimulation(
    @GetUser() user: User,
    @Body() dto: SaveSimulationDto,
  ) {
    return this.simulationService.saveSimulation(user.id, dto);
  }

  /**
   * Get all simulations for commercial user
   */
  @Get('simulations')
  @Auth(ValidRoles.commercial)
  async getSimulations(
    @GetUser() user: User,
    @Query('status') status?: string,
  ) {
    return this.simulationService.getSimulations(user.id, status);
  }

  /**
   * Get a specific simulation
   */
  @Get('simulations/:simulationId')
  @Auth(ValidRoles.commercial)
  async getSimulation(
    @GetUser() user: User,
    @Param('simulationId') simulationId: string,
  ) {
    return this.simulationService.getSimulationById(user.id, simulationId);
  }

  /**
   * Convert simulation to credit (radication)
   */
  @Post('simulations/:simulationId/convert')
  @Auth(ValidRoles.commercial)
  @HttpCode(HttpStatus.OK)
  async convertSimulationToCredit(
    @GetUser() user: User,
    @Param('simulationId') simulationId: string,
  ) {
    return this.simulationService.convertToCredit(user.id, simulationId);
  }
}
