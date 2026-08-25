import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique alphanumeric identifier for system login.',
    example: 'john_doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description:
      'Secure account access token. Must contain at least 8 characters.',
    example: 'P@ssword123!',
    type: String,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'System authorization role mapping.',
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'The complete legal name of the employee.',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'Primary telephone contact number.',
    example: '+251911234567',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({
    description: 'Unique corporate electronic mail destination.',
    example: 'john.doe@company.com',
    type: String,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Official job title or designation within the organization.',
    example: 'Software Engineer',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  position!: string;

  @ApiProperty({
    description:
      'Official employment commencement date formatted as an ISO 8601 string.',
    example: '2026-08-24T00:00:00.000Z',
    type: String,
  })
  @IsDateString()
  hireDate!: string;

  @ApiProperty({
    description: 'The target department database identifier link.',
    example: 'a4b8c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({
    description:
      'Operational status flag. Inactive accounts are blocked from accessing endpoints.',
    example: true,
    type: Boolean,
    required: false,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
