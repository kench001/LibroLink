import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Post()
  @Roles('teacher')
  async create(@Body() createAssignmentDto: CreateAssignmentDto, @Req() req: any) {
    const teacherId = req.user.id;
    return this.assignmentsService.assignBook(
      createAssignmentDto.studentId,
      createAssignmentDto.bookId,
      teacherId,
    );
  }

  @Get()
  @Roles('teacher')
  async findAll() {
    return this.assignmentsService.getAllAssignments();
  }

  @Get('student')
  @Roles('student')
  async findMyAssignments(@Req() req: any) {
    const studentId = req.user.id;
    return this.assignmentsService.getStudentAssignments(studentId);
  }

  @Delete(':id')
  @Roles('teacher')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.removeAssignment(id);
  }
}
