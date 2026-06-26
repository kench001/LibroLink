import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  async findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Post()
  @Roles('teacher')
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `cover-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Cover image is required');
    }
    const coverImageUrl = `/uploads/${file.filename}`;
    return this.booksService.create(createBookDto, coverImageUrl);
  }

  @Put(':id')
  @Roles('teacher')
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `cover-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const coverImageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.booksService.update(id, updateBookDto, coverImageUrl);
  }

  @Delete(':id')
  @Roles('teacher')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
