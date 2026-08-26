import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { EmploymentStatus } from '../../../generated/prisma/client';

export class EmployeeReportDto {
  @ApiPropertyOptional({
    description: 'Filter employees by department ID.',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter employees by employment status.',
    enum: EmploymentStatus,
    example: EmploymentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @ApiPropertyOptional({
    description: 'Include employees hired on or after this date.',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Include employees hired on or before this date.',
    example: '2026-08-26',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
