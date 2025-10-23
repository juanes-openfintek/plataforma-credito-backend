import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Credit } from '../credit/entities/credit.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Credit.name)
    private readonly creditModel: Model<Credit>,
  ) {}

  async getAmountTicketsCollected(startDate?: string, endDate?: string) {
    const query: any = {
      status: 'paid', // Solo créditos pagados
    };

    // Filtrar por rango de fechas si se proporciona
    if (startDate || endDate) {
      query.updatedAt = {};
      if (startDate) {
        query.updatedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.updatedAt.$lte = new Date(endDate);
      }
    }

    const result = await this.creditModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return result.length > 0
      ? [
          {
            totalAmount: result[0].totalAmount || 0,
            count: result[0].count || 0,
          },
        ]
      : [{ totalAmount: 0, count: 0 }];
  }

  async getAmountCirculation(startDate?: string, endDate?: string) {
    const query: any = {
      status: { $in: ['approved', 'inProgress', 'pending'] }, // Créditos activos en circulación
    };

    // Filtrar por rango de fechas si se proporciona
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const result = await this.creditModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return result.length > 0
      ? [
          {
            totalAmount: result[0].totalAmount || 0,
            count: result[0].count || 0,
          },
        ]
      : [{ totalAmount: 0, count: 0 }];
  }

  async getCredits(status?: string) {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    try {
      const credits = await this.creditModel
        .find(query)
        .populate('taxes')
        .populate('user')
        .populate('account')
        .exec();
      return credits;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al obtener créditos.');
    }
  }
}
