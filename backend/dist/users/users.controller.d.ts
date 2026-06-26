import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAllStudents(): Promise<{
        username: string;
        role: string;
        id: number;
        createdAt: Date;
    }[]>;
}
