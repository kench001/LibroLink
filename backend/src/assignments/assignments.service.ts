import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async assignBook(studentId: number, bookId: number, teacherId: number) {
    // 1. Verify student exists and has the role 'student'
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (student.role.toLowerCase() !== 'student') {
      throw new BadRequestException(`User with ID ${studentId} is not a student`);
    }

    // 2. Verify book exists
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // 3. Verify teacher exists (optional check for integrity)
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || teacher.role.toLowerCase() !== 'teacher') {
      throw new BadRequestException(`Only teachers can assign books`);
    }

    // 4. Verify book is not already assigned to student
    const existingAssignment = await this.prisma.assignment.findUnique({
      where: {
        studentId_bookId: {
          studentId,
          bookId,
        },
      },
    });
    if (existingAssignment) {
      throw new ConflictException('This book is already assigned to this student');
    }

    // 5. Create the assignment
    return this.prisma.assignment.create({
      data: {
        studentId,
        bookId,
        assignedById: teacherId,
      },
      include: {
        student: {
          select: { username: true },
        },
        book: {
          select: { title: true },
        },
        assignedBy: {
          select: { username: true },
        },
      },
    });
  }

  async getStudentAssignments(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student || student.role.toLowerCase() !== 'student') {
      throw new NotFoundException(`Student not found`);
    }

    return this.prisma.assignment.findMany({
      where: { studentId },
      include: {
        book: true,
        assignedBy: {
          select: { username: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getAllAssignments() {
    return this.prisma.assignment.findMany({
      include: {
        student: {
          select: { id: true, username: true },
        },
        book: {
          select: { id: true, title: true, coverImage: true },
        },
        assignedBy: {
          select: { username: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async removeAssignment(id: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return this.prisma.assignment.delete({
      where: { id },
    });
  }
}
