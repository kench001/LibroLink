import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(teacher|student)$/i, { message: 'Role must be either teacher or student' })
  role: string;
}
