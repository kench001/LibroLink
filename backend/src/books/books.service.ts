import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto, coverImage: string) {
    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        description: createBookDto.description,
        coverImage,
      },
    });
  }

  async findAll() {
    return this.prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, coverImage?: string) {
    const book = await this.findOne(id);

    const updateData: any = {
      title: updateBookDto.title ?? book.title,
      description: updateBookDto.description ?? book.description,
    };

    if (coverImage) {
      // Remove old image
      this.deleteCoverImage(book.coverImage);
      updateData.coverImage = coverImage;
    }

    return this.prisma.book.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    this.deleteCoverImage(book.coverImage);
    return this.prisma.book.delete({
      where: { id },
    });
  }

  private deleteCoverImage(imagePath: string) {
    if (!imagePath) return;
    try {
      // imagePath is served as '/uploads/filename' or similar, so let's parse filename
      const parts = imagePath.split('/');
      const filename = parts[parts.length - 1];
      const filePath = join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete old cover image: ${imagePath}`, error);
    }
  }
}
