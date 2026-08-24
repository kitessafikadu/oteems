import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '../../../generated/prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The updated access control role assigned to this user',
    enum: UserRole,
    example: UserRole.DEPARTMENT_MANAGER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'The unique UUID of the corresponding employee profile record',
    example: 'a4b8c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiProperty({
    description:
      'Toggle system access status. Set to false to suspend the account.',
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
