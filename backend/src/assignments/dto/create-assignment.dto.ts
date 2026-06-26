import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId: number;

  @IsInt()
  @IsNotEmpty({ message: 'Book ID is required' })
  bookId: number;
}
