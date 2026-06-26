"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const path_1 = require("path");
const fs = __importStar(require("fs"));
let BooksService = class BooksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBookDto, coverImage) {
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
    async findOne(id) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });
        if (!book) {
            throw new common_1.NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }
    async update(id, updateBookDto, coverImage) {
        const book = await this.findOne(id);
        const updateData = {
            title: updateBookDto.title ?? book.title,
            description: updateBookDto.description ?? book.description,
        };
        if (coverImage) {
            this.deleteCoverImage(book.coverImage);
            updateData.coverImage = coverImage;
        }
        return this.prisma.book.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        const book = await this.findOne(id);
        this.deleteCoverImage(book.coverImage);
        return this.prisma.book.delete({
            where: { id },
        });
    }
    deleteCoverImage(imagePath) {
        if (!imagePath)
            return;
        try {
            const parts = imagePath.split('/');
            const filename = parts[parts.length - 1];
            const filePath = (0, path_1.join)(process.cwd(), 'uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error(`Failed to delete old cover image: ${imagePath}`, error);
        }
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BooksService);
//# sourceMappingURL=books.service.js.map