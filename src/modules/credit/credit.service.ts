import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCreditDto } from './dto/create-credit.dto';
import { Credit } from './entities/credit.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from '../../helpers/objectId';
import { UpdateCreditsDto } from './dto/update-credit.dto';
@Injectable()
export class CreditService {
  constructor(
    @InjectModel(Credit.name)
    private readonly creditModel: Model<Credit>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(user: Types.ObjectId, createCreditDto: CreateCreditDto) {
    return this.creditModel.create({
      user,
      ...createCreditDto,
    });
  }

  async updateCredit(body: UpdateCreditsDto) {
    try {
      const { id, ...rest } = body;

      const _id = ObjectId(id);

      const response = await this.creditModel.findOneAndUpdate(
        { _id: _id },
        rest,
        { new: true },
      );
      if (!response)
        throw new InternalServerErrorException('credit/credit-not-found');

      return response;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  createWithoutUser(createCreditDto: CreateCreditDto) {
    return this.creditModel.create(createCreditDto);
  }

  getCreditsByUser(user: Types.ObjectId) {
    return this.creditModel.find({ user });
  }

  getAllCredits(body = {}) {
    return this.creditModel.find(body);
  }

  private handleDBError(error: any): never {
    if (error?.response?.message === 'credit/credit-not-found')
      throw new NotFoundException(error.message);

    console.log(error);

    throw new InternalServerErrorException('Por favor revise los logs.');
  }
}
