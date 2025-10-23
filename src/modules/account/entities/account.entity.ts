import { User } from '../../../modules/auth/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: String, required: true })
  accountNumber: string;

  @Prop({ type: String, required: true })
  accountType: string;

  @Prop({ type: String, required: true })
  lastNumbers: string;

  @Prop({ type: String, required: true })
  accountEntity: string;

  @Prop({ type: String })
  urlCertificate: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  default: boolean;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
