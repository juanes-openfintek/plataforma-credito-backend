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
} from './dto';
import { ValidRoles } from './interfaces';
import {
  getAuth,
  /* signInWithCustomToken, */
  signInWithEmailAndPassword,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  sendPasswordResetEmail,
  updateEmail,
} from 'firebase/auth';

import * as admin from 'firebase-admin';
import { UpdateUserAdminDto } from './dto/updateUser.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
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
      });

      sendEmailVerification(userCredentials.user)
        .then(() => {
          // Email verification sent!
          console.log('Email verification sent!');
        })
        .catch((error) => {
          console.log(error);
        });

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
      });

      sendEmailVerification(userCredentials.user)
        .then(() => {
          // Email verification sent!
          console.log('Email verification sent!');
        })
        .catch((error) => {
          console.log(error);
        });

      const token = await admin
        .auth()
        .createCustomToken(userCredentials.user.uid);

      return { token: token };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async sendEmailVerification(token: string | null): Promise<any> {
    const auth = getAuth();

    if (!token) throw new UnauthorizedException('Token not valid');

    try {
      const user = await signInWithCustomToken(auth, token);

      await sendEmailVerification(user.user).then(() => {
        // Email verification sent!
        console.log('Email verification sent!');
      });

      return { message: 'Email verification sent!' };
    } catch (error) {
      // Maneja los errores de autenticación adecuadamente
      this.handleDBError(error);
    }
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

      // Si el usuario existe en MongoDB, retornar sus datos completos
      if (userData) {
        return { 
          token: token,
          user: userData.toJSON()
        };
      }

      // Si no existe en MongoDB, retornar solo el token y datos básicos de Firebase
      return { 
        token: token,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
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
    let emailVerified = false;

    try {
      if (updateUserDto?.email) {
        const auth = getAuth();
        const userFirebase = await signInWithCustomToken(auth, token);

        await updateEmail(userFirebase.user, updateUserDto.email);
        console.log('Email updated!');

        await admin.auth().updateUser(userFirebase.user.uid, {
          emailVerified: false,
        });

        emailVerified = true;
      }

      const updatedUser = await this.userModel.findOneAndUpdate(
        { uid: user.uid },
        {
          ...updateUserDto,
          ...(emailVerified ? { emailVerified: false } : null),
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
}
