import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignDepartmentManagerDto {
  @ApiProperty({
    description:
      'The database ID of the employee who will be assigned as the department manager.',
    example: '8f631a5c-53c9-4c1a-84ac-f10e4f6d6f81',
  })
  @IsString()
  @IsNotEmpty()
  managerId!: string;
}
