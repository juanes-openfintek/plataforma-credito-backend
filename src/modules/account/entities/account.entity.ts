import { User } from '../../../modules/auth/entities/user.entity';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class Account {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: String, required: true })
  accountNumber: string;

  @Prop({ type: String, required: true })
  accountType: string;

  @Prop({ type: String, required: true })
  lastNumbers: string;
}
