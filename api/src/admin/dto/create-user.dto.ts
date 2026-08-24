import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserRole } from '../../../generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description:
      'Unique username for account identification and authentication',
    example: 'john_doe',
    type: String,
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'Secure, raw account password (will be hashed before storage)',
    example: 'P@ssword123!',
    type: String,
    minLength: 6,
  })
  @IsString()
  password!: string;

  @ApiProperty({
    description:
      'The access control role assigned to this user within the system',
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  @IsEnum(UserRole)
  role!: UserRole;

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
    description: 'System access status flag. Disabled accounts cannot log in.',
    example: true,
    type: Boolean,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
