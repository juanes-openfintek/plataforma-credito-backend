import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'Verified employment information with HR department',
  })
  @IsString()
  comment: string;
}

