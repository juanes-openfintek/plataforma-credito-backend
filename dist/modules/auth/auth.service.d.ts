import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { LoginUserDto, RegisterUserDto, RegisterUserRoleDto, UpdateUserDto, UserEmailDto } from './dto';
import { UpdateUserAdminDto } from './dto/updateUser.dto';
export declare class AuthService {
    private readonly userModel;
    private readonly jwtService;
    constructor(userModel: Model<User>, jwtService: JwtService);
    register(registerUserDto: RegisterUserDto): Promise<{
        token: string;
    }>;
    registerRole(registerUserDto: RegisterUserRoleDto): Promise<{
        token: string;
    }>;
    sendEmailVerification(token: string | null): Promise<any>;
    sendPasswordResetEmail({ email }: UserEmailDto): Promise<any>;
    login(loginUserDto: LoginUserDto): Promise<any>;
    authUser(user: any): Promise<any>;
    updateUser(user: any, updateUserDto: UpdateUserDto, token: string): Promise<any>;
    updateUserAdmin(updateUserDto: UpdateUserAdminDto): Promise<any>;
    private handleDBError;
}
