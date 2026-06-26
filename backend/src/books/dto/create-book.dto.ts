import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}
