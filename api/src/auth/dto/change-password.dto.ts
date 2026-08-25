import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: "The user's current active password to verify identity",
    example: 'admin@123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    description:
      'The secure new password meeting the minimum length constraint',
    example: 'NewSecureP@ss1!',
    type: String,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
