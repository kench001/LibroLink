import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
export declare class AssignmentsController {
    private assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    create(createAssignmentDto: CreateAssignmentDto, req: any): Promise<{
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
    findAll(): Promise<({
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
    findMyAssignments(req: any): Promise<({
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
    remove(id: number): Promise<{
        id: number;
        studentId: number;
        bookId: number;
        assignedById: number;
        assignedAt: Date;
    }>;
}
