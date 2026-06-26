import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
export declare class BooksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBookDto: CreateBookDto, coverImage: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        coverImage: string;
    }>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        coverImage: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        coverImage: string;
    }>;
    update(id: number, updateBookDto: UpdateBookDto, coverImage?: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        coverImage: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        coverImage: string;
    }>;
    private deleteCoverImage;
}
