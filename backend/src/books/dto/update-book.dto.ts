import { IsString, IsOptional } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
