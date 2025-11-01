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
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/getUser.decorator';
import { ValidRoles } from '../auth/interfaces/validRoles.interface';
import { User } from '../auth/entities/user.entity';
import { SimulationService } from './services/simulation.service';

@Controller('commercial')
export class CommercialController {
  constructor(
    private readonly commercialService: CommercialService,
    private readonly simulationService: SimulationService,
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
