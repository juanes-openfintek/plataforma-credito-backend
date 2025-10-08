import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto, RegisterUserRoleDto, UpdateUserDto, UserEmailDto } from './dto';
import { User } from './entities/user.entity';
import { UpdateUserAdminDto } from './dto/updateUser.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerUser(registerUserDto: RegisterUserDto): Promise<{
        token: string;
    }>;
    loginUser(loginUserDto: LoginUserDto): Promise<any>;
    createUser(createUserDto: RegisterUserRoleDto): Promise<{
        token: string;
    }>;
    validate(user: User): Promise<any>;
    sendEmailVerification(req: Request): Promise<any>;
    sendPasswordResetEmail(email: UserEmailDto): Promise<any>;
    updateUser(updateUserDto: UpdateUserDto, user: User, req: Request): Promise<any>;
    updateUserAdmin(updateUserDto: UpdateUserAdminDto): Promise<any>;
    private(): {
        message: string;
    };
    privateRoute2(user: User): {
        ok: boolean;
        user: User;
    };
    privateRoute3(user: User): {
        ok: boolean;
        user: User;
    };
}
