import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'The unique official name of the department',
    example: 'Engineering',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'The ID of the employee designated as the department manager',
    example: 'cm7a1b2c30000abc123456789',
  })
  @IsOptional()
  @IsString()
  managerId?: string;
}
