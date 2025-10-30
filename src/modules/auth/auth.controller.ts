import { Controller, Post, Body, Get, Request, Put, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserDto,
  RegisterUserDto,
  RegisterUserRoleDto,
  UpdateUserDto,
  UserEmailDto,
} from './dto';
import { GetUser, Auth } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';
import { ValidEmail } from './decorators/validEmail.decorator';
import { UpdateUserAdminDto } from './dto/updateUser.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('create-user')
  @Auth(ValidRoles.admin)
  createUser(@Body() createUserDto: RegisterUserRoleDto) {
    return this.authService.registerRole(createUserDto);
  }

  @Get('validate')
  @Auth()
  validate(@GetUser() user: User) {
    return this.authService.authUser(user);
  }

  @Post('verify-email')
  @Auth()
  sendEmailVerification(@Request() req: Request) {
    return this.authService.sendEmailVerification(
      req.headers['authorization'].split(' ')[1] ?? null,
    );
  }

  @Post('reset-email')
  sendPasswordResetEmail(@Body() email: UserEmailDto) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Put('update-user')
  @Auth()
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
    @Request() req: Request,
  ) {
    return this.authService.updateUser(
      user,
      updateUserDto,
      req.headers['authorization'].split(' ')[1] ?? null,
    );
  }

  @Put('update-user-admin')
  @Auth(ValidRoles.admin)
  updateUserAdmin(@Body() updateUserDto: UpdateUserAdminDto) {
    return this.authService.updateUserAdmin(updateUserDto);
  }

  @Get('private')
  @Auth(ValidRoles.user)
  @ValidEmail()
  private() {
    return {
      message: 'This is a private route',
    };
  }

  @Get('private2')
  @Auth(ValidRoles.disburser, ValidRoles.admin)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Post('self-delete')
  @Auth()
  selfDelete(@GetUser() user: User) {
    return this.authService.deleteSelf(user);
  }

  @Get('get-users')
  @Auth(ValidRoles.admin)
  getUsers(@Query() query: any) {
    return this.authService.getUsers(query);
  }
}
