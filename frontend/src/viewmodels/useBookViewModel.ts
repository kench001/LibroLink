import { useState, useCallback } from 'react';
import { apiClient } from '../models/api';
import type { Book } from '../models/api';

export const useBookViewModel = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<Book[]>('/books');
      setBooks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBook = async (title: string, description: string, coverImage: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('coverImage', coverImage);

      const response = await apiClient.post<Book>('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBooks((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      const errMsg = Array.isArray(serverMessage) ? serverMessage[0] : (serverMessage || 'Failed to create book');
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBook = async (id: number, title?: string, description?: string, coverImage?: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (coverImage) formData.append('coverImage', coverImage);

      const response = await apiClient.put<Book>(`/books/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBooks((prev) => prev.map((b) => (b.id === id ? response.data : b)));
      return response.data;
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      const errMsg = Array.isArray(serverMessage) ? serverMessage[0] : (serverMessage || 'Failed to update book');
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to delete book';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    books,
    isLoading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  };
};
export type UseBookViewModelType = ReturnType<typeof useBookViewModel>;
