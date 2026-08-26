import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  LeaveRequestStatus,
  LeaveType,
} from '../../../generated/prisma/client';

export class LeaveReportDto {
  @ApiPropertyOptional({
    description: 'Filter leave requests by department ID.',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter leave requests by leave type.',
    enum: LeaveType,
    example: LeaveType.ANNUAL,
  })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiPropertyOptional({
    description: 'Filter leave requests by workflow status.',
    enum: LeaveRequestStatus,
    example: LeaveRequestStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(LeaveRequestStatus)
  status?: LeaveRequestStatus;

  @ApiPropertyOptional({
    description: 'Include requests starting on or after this date.',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Include requests ending on or before this date.',
    example: '2026-08-26',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
