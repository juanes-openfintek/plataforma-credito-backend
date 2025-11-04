import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateCommercialUserDto } from './dto/create-commercial-user.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth } from '../auth/decorators';

@Controller('admin')
@Auth(ValidRoles.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }

  /**
   * Crear usuario comercial (solo admin)
   */
  @Post('commercial-users')
  @HttpCode(HttpStatus.CREATED)
  createCommercialUser(@Body() createCommercialUserDto: CreateCommercialUserDto) {
    return this.adminService.createCommercialUser(createCommercialUserDto);
  }

  /**
   * Listar todos los usuarios comerciales
   */
  @Get('commercial-users')
  getAllCommercialUsers() {
    return this.adminService.getAllCommercialUsers();
  }

  /**
   * Obtener un usuario comercial específico
   */
  @Get('commercial-users/:id')
  getCommercialUser(@Param('id') id: string) {
    return this.adminService.getCommercialUser(id);
  }

  /**
   * Actualizar usuario comercial
   */
  @Patch('commercial-users/:id')
  updateCommercialUser(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateCommercialUserDto>,
  ) {
    return this.adminService.updateCommercialUser(id, updateData);
  }

  /**
   * Eliminar usuario comercial
   */
  @Delete('commercial-users/:id')
  deleteCommercialUser(@Param('id') id: string) {
    return this.adminService.deleteCommercialUser(id);
  }
}
