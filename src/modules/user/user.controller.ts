import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ProfileSuggestionsService } from './services/profile-suggestions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
@Auth(
  ValidRoles.user,
  ValidRoles.admin,
  ValidRoles.approver,
  ValidRoles.disburser,
)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileSuggestionsService: ProfileSuggestionsService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get(':id/suggestions')
  @ApiOperation({
    summary: 'Get profile improvement suggestions',
    description: 'Returns personalized suggestions to improve user profile and credit score'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions retrieved successfully',
    schema: {
      example: {
        suggestions: [
          {
            category: 'DOCUMENTS',
            priority: 'HIGH',
            message: 'Documentos de identidad no cargados',
            impactOnScore: -10,
            action: 'Cargar DNI y comprobante de ingresos',
            timeEstimate: '5 minutos'
          }
        ],
        totalImpact: -15,
        currentScore: 70,
        potentialScore: 85,
        hasIncompleteProfile: true,
        completionPercentage: 75
      }
    }
  })
  async getUserSuggestions(@Param('id') id: string, @GetUser() user: User) {
    // Users can only see their own suggestions, admins can see all
    if (id !== user.id && !user.roles.includes(ValidRoles.admin)) {
      throw new Error('You can only view your own suggestions');
    }

    return this.profileSuggestionsService.getUserSuggestions(id);
  }

  @Get('me/suggestions')
  @Auth(ValidRoles.user)
  @ApiOperation({
    summary: 'Get my profile suggestions',
    description: 'Returns suggestions for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions retrieved successfully'
  })
  async getMySuggestions(@GetUser() user: User) {
    return this.profileSuggestionsService.getUserSuggestions(user.id);
  }
}
