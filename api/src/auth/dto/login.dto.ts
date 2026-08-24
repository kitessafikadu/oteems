import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The unique username of the account',
    example: 'admin',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'The secure account password',
    example: 'admin@123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
