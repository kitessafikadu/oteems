import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectLeaveRequestDto {
  @ApiProperty({
    description: 'Reason why the leave request is being rejected.',
    example: 'The requested dates conflict with an important project deadline.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  rejectionReason!: string;
}
