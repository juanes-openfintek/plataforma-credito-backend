import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateCommercialUserDto } from './dto/create-commercial-user.dto';
import { User } from '../auth/entities/user.entity';
import { CommercialUser } from '../commercial/entities/commercial-user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(CommercialUser.name)
    private commercialUserModel: Model<CommercialUser>,
  ) {}

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  /**
   * Crear usuario comercial (solo admin puede hacerlo)
   */
  async createCommercialUser(dto: CreateCommercialUserDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findOne({ usuario: dto.usuario });
      if (existingUser) {
        throw new BadRequestException('El usuario ya existe');
      }

      // Verificar si el número de registro ya existe
      const existingCommercial = await this.commercialUserModel.findOne({
        registrationNumber: dto.registrationNumber,
      });
      if (existingCommercial) {
        throw new BadRequestException('El número de registro ya está en uso');
      }

      // Hashear el código (password)
      const hashedCodigo = await bcrypt.hash(dto.codigo, 10);

      // Crear el usuario base
      const user = new this.userModel({
        usuario: dto.usuario,
        password: hashedCodigo,
        roles: ['commercial'],
        isActive: true,
      });

      const savedUser = await user.save();

      // Crear el perfil comercial
      const commercialUser = new this.commercialUserModel({
        user: savedUser._id,
        companyName: dto.companyName,
        registrationNumber: dto.registrationNumber,
        taxId: dto.taxId,
        businessPhone: dto.businessPhone,
        businessAddress: dto.businessAddress,
        city: dto.city,
        department: dto.department,
        legalRepresentativeName: dto.legalRepresentativeName,
        legalRepresentativeDocument: dto.legalRepresentativeDocument,
        businessSector: dto.businessSector,
        annualRevenue: dto.annualRevenue,
        companyEmail: dto.companyEmail,
      });

      const savedCommercial = await commercialUser.save();

      return {
        message: 'Usuario comercial creado exitosamente',
        user: {
          id: savedUser._id,
          usuario: savedUser.usuario,
          roles: savedUser.roles,
        },
        commercial: {
          id: savedCommercial._id,
          companyName: savedCommercial.companyName,
          registrationNumber: savedCommercial.registrationNumber,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear usuario comercial: ${error.message}`);
    }
  }

  /**
   * Obtener todos los usuarios comerciales
   */
  async getAllCommercialUsers() {
    const commercialUsers = await this.commercialUserModel
      .find()
      .populate('user', 'usuario isActive createdAt')
      .sort({ createdAt: -1 });

    return commercialUsers;
  }

  /**
   * Obtener un usuario comercial específico
   */
  async getCommercialUser(id: string) {
    const commercial = await this.commercialUserModel
      .findById(id)
      .populate('user', 'usuario isActive createdAt');

    if (!commercial) {
      throw new NotFoundException('Usuario comercial no encontrado');
    }

    return commercial;
  }

  /**
   * Actualizar usuario comercial
   */
  async updateCommercialUser(id: string, updateData: Partial<CreateCommercialUserDto>) {
    const commercial = await this.commercialUserModel.findById(id);

    if (!commercial) {
      throw new NotFoundException('Usuario comercial no encontrado');
    }

    // Si se actualiza el código, hashearlo
    if (updateData.codigo) {
      const user = await this.userModel.findById(commercial.user);
      if (user) {
        user.password = await bcrypt.hash(updateData.codigo, 10);
        await user.save();
      }
      delete updateData.codigo; // No guardar en el perfil comercial
    }

    // Actualizar el perfil comercial
    Object.assign(commercial, updateData);
    await commercial.save();

    return {
      message: 'Usuario comercial actualizado exitosamente',
      commercial,
    };
  }

  /**
   * Eliminar usuario comercial
   */
  async deleteCommercialUser(id: string) {
    const commercial = await this.commercialUserModel.findById(id);

    if (!commercial) {
      throw new NotFoundException('Usuario comercial no encontrado');
    }

    // Eliminar el usuario base también
    await this.userModel.findByIdAndDelete(commercial.user);

    // Eliminar el perfil comercial
    await this.commercialUserModel.findByIdAndDelete(id);

    return {
      message: 'Usuario comercial eliminado exitosamente',
    };
  }
}
