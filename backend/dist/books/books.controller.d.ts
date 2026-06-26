import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
export declare class BooksController {
    private booksService;
    constructor(booksService: BooksService);
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
    create(createBookDto: CreateBookDto, file: Express.Multer.File): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        coverImage: string;
    }>;
    update(id: number, updateBookDto: UpdateBookDto, file?: Express.Multer.File): Promise<{
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
}
