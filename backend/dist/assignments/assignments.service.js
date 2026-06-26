"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssignmentsService = class AssignmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assignBook(studentId, bookId, teacherId) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${studentId} not found`);
        }
        if (student.role.toLowerCase() !== 'student') {
            throw new common_1.BadRequestException(`User with ID ${studentId} is not a student`);
        }
        const book = await this.prisma.book.findUnique({
            where: { id: bookId },
        });
        if (!book) {
            throw new common_1.NotFoundException(`Book with ID ${bookId} not found`);
        }
        const teacher = await this.prisma.user.findUnique({
            where: { id: teacherId },
        });
        if (!teacher || teacher.role.toLowerCase() !== 'teacher') {
            throw new common_1.BadRequestException(`Only teachers can assign books`);
        }
        const existingAssignment = await this.prisma.assignment.findUnique({
            where: {
                studentId_bookId: {
                    studentId,
                    bookId,
                },
            },
        });
        if (existingAssignment) {
            throw new common_1.ConflictException('This book is already assigned to this student');
        }
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
    async getStudentAssignments(studentId) {
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
        });
        if (!student || student.role.toLowerCase() !== 'student') {
            throw new common_1.NotFoundException(`Student not found`);
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
    async removeAssignment(id) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw new common_1.NotFoundException(`Assignment with ID ${id} not found`);
        }
        return this.prisma.assignment.delete({
            where: { id },
        });
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map