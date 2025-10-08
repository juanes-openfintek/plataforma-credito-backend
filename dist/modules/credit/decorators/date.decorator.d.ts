import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare class IsAdultConstraint implements ValidatorConstraintInterface {
    validate(dateOfBirth: Date, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsAdult(validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
