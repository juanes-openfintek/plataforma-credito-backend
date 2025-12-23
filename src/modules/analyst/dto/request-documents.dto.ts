import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestDocumentsDto {
  @ApiProperty({
    description: 'List of document types required',
    example: ['INCOME_PROOF', 'BANK_STATEMENTS'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  documentTypes: string[];

  @ApiProperty({
    description: 'Message for the user explaining what documents are needed',
    example: 'Please upload your last 3 months bank statements',
  })
  @IsString()
  message: string;
}

