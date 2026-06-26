import { PrismaService } from '../prisma/prisma.service';
export declare class AssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    assignBook(studentId: number, bookId: number, teacherId: number): Promise<{
        book: {
            title: string;
        };
        student: {
            username: string;
        };
        assignedBy: {
            username: string;
        };
    } & {
        id: number;
        studentId: number;
        bookId: number;
        assignedById: number;
        assignedAt: Date;
    }>;
    getStudentAssignments(studentId: number): Promise<({
        book: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            coverImage: string;
        };
        assignedBy: {
            username: string;
        };
    } & {
        id: number;
        studentId: number;
        bookId: number;
        assignedById: number;
        assignedAt: Date;
    })[]>;
    getAllAssignments(): Promise<({
        book: {
            id: number;
            title: string;
            coverImage: string;
        };
        student: {
            username: string;
            id: number;
        };
        assignedBy: {
            username: string;
        };
    } & {
        id: number;
        studentId: number;
        bookId: number;
        assignedById: number;
        assignedAt: Date;
    })[]>;
    removeAssignment(id: number): Promise<{
        id: number;
        studentId: number;
        bookId: number;
        assignedById: number;
        assignedAt: Date;
    }>;
}
