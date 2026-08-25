import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { EmploymentStatus } from '../../../generated/prisma/client';

export class UpdateEmployeeStatusDto {
  @ApiProperty({
    description: 'The updated employment status of the employee',
    enum: EmploymentStatus,
    example: EmploymentStatus.ACTIVE,
  })
  @IsEnum(EmploymentStatus)
  status!: EmploymentStatus;
}
