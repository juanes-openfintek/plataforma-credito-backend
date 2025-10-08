import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetTaxesDto, UpdateTaxesDto } from './dto/update-taxes.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Taxes } from './entities/taxes.entity';
import { CreateTaxesDto } from './dto/create-taxes.dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { ObjectId } from '../../helpers/objectId';

@Injectable()
export class TaxesService {
  constructor(
    @InjectModel(Taxes.name)
    private readonly taxesModel: Model<any>,
  ) {}

  findAll(body: GetTaxesDto) {
    return this.taxesModel.find(body).sort({ minAmount: 1 });
  }

  create(body: CreateTaxesDto) {
    return this.taxesModel.create(body);
  }

  async update(body: UpdateTaxesDto) {
    try {
      const { id, ...rest } = body;

      const _id = ObjectId(id);

      const response = await this.taxesModel.findOneAndUpdate(
        { _id: _id },
        rest,
        { new: true },
      );
      if (!response)
        throw new InternalServerErrorException('taxes/taxes-not-found');

      return response;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async getByRange(value: number) {
    try {
      const response = await this.taxesModel.findOne({
        minAmount: { $lte: value },
        maxAmount: { $gte: value },
      });
      if (!response)
        throw new InternalServerErrorException('taxes/taxes-not-found');

      return response;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any): never {
    if (error?.response?.message === 'taxes/taxes-not-found')
      throw new NotFoundException(error.message);

    console.log(error);

    throw new InternalServerErrorException('Por favor revise los logs.');
  }
}
