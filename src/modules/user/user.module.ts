import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProfileSuggestionsService } from './services/profile-suggestions.service';
import { User, UserSchema } from '../auth/entities/user.entity';
import { Credit, CreditSchema } from '../credit/entities/credit.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Credit.name, schema: CreditSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, ProfileSuggestionsService],
  exports: [ProfileSuggestionsService],
})
export class UserModule {}
