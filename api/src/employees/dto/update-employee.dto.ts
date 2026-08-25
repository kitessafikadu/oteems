import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Updated full legal name of the employee',
    example: 'Jane Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Updated contact phone number of the employee',
    example: '+1234567890',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Updated work email address of the employee',
    example: 'jane.doe@company.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated job position or title',
    example: 'Senior Software Engineer',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    description: 'Updated employment hire date in ISO 8601 format',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({
    description: 'ID of the department to assign the employee to',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departmentId?: string;
}
