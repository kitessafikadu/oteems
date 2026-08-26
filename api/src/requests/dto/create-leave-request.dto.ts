import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import { LeaveType } from '../../../generated/prisma/client';

export class CreateLeaveRequestDto {
  @ApiProperty({
    description: 'Type of leave being requested.',
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @ApiProperty({
    description: 'First day of the requested leave.',
    example: '2026-09-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Last day of the requested leave.',
    example: '2026-09-05',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'Reason for requesting leave.',
    example: 'Annual family vacation.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
