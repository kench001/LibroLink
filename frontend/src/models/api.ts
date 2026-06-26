import axios from 'axios';

// Default API Base URL. Can be overridden in .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for receiving/sending HTTP-Only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  username: string;
  role: 'teacher' | 'student';
}

export interface Book {
  id: number;
  title: string;
  description: string;
  coverImage: string; // static URL from backend
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  studentId: number;
  bookId: number;
  assignedById: number;
  assignedAt: string;
  student?: {
    username: string;
  };
  book: Book;
  assignedBy: {
    username: string;
  };
}
