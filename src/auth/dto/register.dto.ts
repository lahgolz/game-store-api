import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'dev@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
