/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAdult', async: false })
@Injectable()
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(dateOfBirth: Date, args: ValidationArguments) {
    // Calcula la edad a partir de la fecha de nacimiento
    if (!(dateOfBirth instanceof Date)) return false;

    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    if (
      today.getMonth() < dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() &&
        today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    // Comprueba si la edad es mayor o igual a 18 años
    return age >= 18;
  }

  defaultMessage(args: ValidationArguments) {
    return 'La fecha de nacimiento no es válida (debes ser mayor de 18 años)';
  }
}

export function IsAdult(validationOptions?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAdultConstraint,
    });
  };
}
