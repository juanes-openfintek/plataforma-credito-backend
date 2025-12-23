import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import {
  LoginUserDto,
  RegisterUserDto,
  RegisterUserRoleDto,
  UpdateUserDto,
  UserEmailDto,
  LoginCommercialDto,
} from './dto';
import { ValidRoles } from './interfaces';
import {
  getAuth,
  /* signInWithCustomToken, */
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  sendPasswordResetEmail,
  updateEmail,
} from 'firebase/auth';

import * as admin from 'firebase-admin';
import { UpdateUserAdminDto } from './dto/updateUser.dto';
import { CommercialService } from '../commercial/commercial.service';
import { RegisterCommercialUserDto } from '../commercial/dto/register-commercial.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly commercialService: CommercialService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const { password, email } = registerUserDto;

      const roles: string[] = [ValidRoles.user];

      const auth = getAuth();

      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await this.userModel.create({
        uid: userCredentials.user.uid,
        email,
        roles,
        emailVerified: true,
      });

      console.warn('Email verification skipped (demo mode active).');

      const token = await admin
        .auth()
        .createCustomToken(userCredentials.user.uid);

      return { token: token };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async registerRole(registerUserDto: RegisterUserRoleDto) {
    try {
      const { name, password, email, lastname, identificationNumber, commission } = registerUserDto;

      let roles: string[] = [ValidRoles.user];

      if (registerUserDto?.roles) {
        if (!registerUserDto.roles.includes(ValidRoles.user)) {
          registerUserDto.roles.push(ValidRoles.user);
        }

        roles = registerUserDto.roles;
      }

      const auth = getAuth();

      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await this.userModel.create({
        uid: userCredentials.user.uid,
        name,
        lastname,
        email,
        roles,
        documentNumber: identificationNumber,
        commission,
        emailVerified: true,
      });

      console.warn('Email verification skipped (demo mode active).');

      const token = await admin
        .auth()
        .createCustomToken(userCredentials.user.uid);

      return { token: token };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async sendEmailVerification(token: string | null): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('Token not valid');
    }

    console.warn('Email verification request omitted (demo mode).');
    return {
      message: 'La verificaci�n de correo est� deshabilitada temporalmente para la demo.',
    };
  }
  async sendPasswordResetEmail({ email }: UserEmailDto): Promise<any> {
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email).then(() => {
        console.log('Email for reset password sent!');
      });

      return { message: 'Email for reset password sent!' };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const token = await admin.auth().createCustomToken(userCredential.user.uid);

      // Buscar datos del usuario en MongoDB
      const userData = await this.userModel.findOne({ uid: userCredential.user.uid });
      const normalizedUser = userData
        ? await this.migrateLegacyRoles(userData)
        : null;

      // Si el usuario existe en MongoDB, retornar sus datos completos
      if (normalizedUser) {
        return { 
          token: token,
          user: normalizedUser.toJSON()
        };
      }

      // Si no existe en MongoDB, retornar solo el token y datos básicos de Firebase
      return { 
        token: token,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: true,
          roles: ['user']
        }
      };
    } catch (error) {
      // Maneja los errores de autenticación adecuadamente
      this.handleDBError(error);
    }
  }

  async authUser(user: any): Promise<any> {
    const token = await admin.auth().createCustomToken(user.uid);

    return { ...user.toJSON(), token };
  }

  async updateUser(
    user: any,
    updateUserDto: UpdateUserDto,
    token: string,
  ): Promise<any> {
    let emailUpdated = false;

    try {
      if (updateUserDto?.email) {
        const auth = getAuth();
        const userFirebase = await signInWithCustomToken(auth, token);

        await updateEmail(userFirebase.user, updateUserDto.email);
        console.log('Email updated!');

        await admin.auth().updateUser(userFirebase.user.uid, {
          emailVerified: true,
        });

        emailUpdated = true;
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { uid: user.uid },
        {
          ...updateUserDto,
          ...(emailUpdated ? { emailVerified: true } : null),
        },
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async updateUserAdmin(updateUserDto: UpdateUserAdminDto): Promise<any> {
    const { uid, ...updateUser } = updateUserDto;

    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { uid },
        {
          ...updateUser,
        },
        { new: true },
      );

      if (!updatedUser)
        throw new InternalServerErrorException('auth/user-not-found');

      return updatedUser;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async deleteSelf(user: User): Promise<{ message: string }> {
    try {
      await admin
        .auth()
        .deleteUser(user.uid)
        .catch((error) => {
          if (error?.code !== 'auth/user-not-found') {
            throw error;
          }
        });

      const deletionResult = await this.userModel.deleteOne({ uid: user.uid });

      if (!deletionResult.deletedCount) {
        throw new NotFoundException('auth/user-not-found');
      }

      return { message: 'Cuenta eliminada correctamente.' };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  /**
   * Normaliza roles legacy (approver/disburser) a los nuevos roles de analista.
   * Si detecta un rol obsoleto, actualiza el documento en Mongo y retorna el usuario con roles corregidos.
   */
  private async migrateLegacyRoles(user: any): Promise<any> {
    const roles: string[] = user?.roles || [];
    const hasLegacyRole = roles.some((role) =>
      ['approver', 'disburser'].includes(role),
    );

    if (!hasLegacyRole) {
      return user;
    }

    const updatedRoles = new Set(
      roles.filter((role) => !['approver', 'disburser'].includes(role)),
    );

    // Distribuir approver entre los tres niveles de analista de forma determinista
    if (roles.includes('approver')) {
      const analystLevels = [
        ValidRoles.analyst1,
        ValidRoles.analyst2,
        ValidRoles.analyst3,
      ];
      const hashSource = (user.uid || user._id?.toString() || '').toString();
      const hash = hashSource
        .split('')
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const targetRole = analystLevels[hash % analystLevels.length];
      updatedRoles.add(targetRole);
    }

    // Disburser ahora se maneja con analyst3
    if (roles.includes('disburser')) {
      updatedRoles.add(ValidRoles.analyst3);
    }

    const normalizedRoles = Array.from(updatedRoles);
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { roles: normalizedRoles } },
    );

    user.roles = normalizedRoles;
    return user;
  }

  private handleDBError(error: any): never {
    if (error?.code === 'auth/wrong-password')
      throw new UnauthorizedException(error.message);
    if (error?.code === 'auth/user-disabled')
      throw new UnauthorizedException(error.message);
    if (error?.code === 'auth/email-already-exists')
      throw new ConflictException(error.message);
    if (error?.code === 'auth/email-already-in-use')
      throw new ConflictException(error.message);
    if (error?.code === 'auth/invalid-email')
      throw new ConflictException(error.message);
    if (error?.response?.message === 'auth/user-not-found')
      throw new NotFoundException(error.message);

    console.log(error);

    throw new InternalServerErrorException('Por favor revise los logs.');
  }

  async getUsers(query: any = {}) {
    try {
      const users = await this.userModel.find(query).exec();
      return users;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al obtener usuarios.');
    }
  }

  async registerCommercial(
    registerCommercialDto: RegisterCommercialUserDto,
  ): Promise<any> {
    try {
      const { email, password, companyName, registrationNumber, taxId } =
        registerCommercialDto;

      const roles: string[] = [ValidRoles.user, ValidRoles.commercial];

      const auth = getAuth();

      // Create Firebase user
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Create User document in MongoDB
      const mongoUser = await this.userModel.create({
        uid: userCredentials.user.uid,
        email,
        roles,
        emailVerified: true,
        name: registerCommercialDto.legalRepresentativeName,
      });

      // Create Commercial profile
      const commercialProfile =
        await this.commercialService.createCommercialProfile(
          mongoUser._id.toString(),
          registerCommercialDto,
        );

      console.warn('Email verification skipped (demo mode active).');

      const token = await admin
        .auth()
        .createCustomToken(userCredentials.user.uid);

      return {
        token: token,
        user: {
          uid: userCredentials.user.uid,
          email: mongoUser.email,
          roles: mongoUser.roles,
          commercialId: commercialProfile._id,
          companyName: commercialProfile.companyName,
        },
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async loginCommercial(loginCommercialDto: LoginCommercialDto): Promise<any> {
    try {
      const { usuario, codigo } = loginCommercialDto;

      // Buscar el usuario comercial en la base de datos
      const user = await this.userModel
        .findOne({ usuario })
        .select('+password')
        .exec();

      if (!user) {
        throw new UnauthorizedException('Usuario o código incorrectos');
      }

      // Verificar que el usuario tiene el rol de comercial
      if (!user.roles.includes(ValidRoles.commercial)) {
        throw new UnauthorizedException('Usuario no autorizado como comercial');
      }

      // Verificar el código (password)
      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(codigo, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Usuario o código incorrectos');
      }

      // Obtener información del perfil comercial
      const commercialProfile = await this.commercialService.getCommercialProfile(user._id.toString());

      // Generar token JWT
      const payload = {
        sub: user._id.toString(),
        usuario: user.usuario,
        roles: user.roles,
      };

      const token = this.jwtService.sign(payload);

      return {
        token: token,
        user: {
          id: user._id,
          usuario: user.usuario,
          roles: user.roles,
          isActive: user.isActive,
          companyName: commercialProfile?.companyName || 'N/A',
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.handleDBError(error);
    }
  }
}




