import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnCreditDto {
  @ApiProperty({
    description: 'Reason for returning the credit',
    example: 'Incomplete personal information',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Additional notes for the previous stage',
    example: 'Please verify phone number and employment dates',
    required: false,
  })
  @IsString()
  notes?: string;
}
