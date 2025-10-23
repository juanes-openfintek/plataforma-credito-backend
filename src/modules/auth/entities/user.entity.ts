import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  get id(): string {
    return this.id;
  }

  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  /* @Prop({ type: String, select: false })
  password: string; */

  @Prop({ type: String, required: true, unique: true, index: true })
  uid: string;

  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @Prop({ type: [String], required: true, default: ['user'] })
  roles: string[];

  @Prop({ type: Boolean, required: true, default: false })
  emailVerified: boolean;

  @Prop({ type: String })
  documentNumber: string;

  @Prop({ type: String })
  documentType: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  secondName: string;

  @Prop({ type: String })
  lastname: string;

  @Prop({ type: String })
  secondLastname: string;

  @Prop({ type: String })
  commission: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
