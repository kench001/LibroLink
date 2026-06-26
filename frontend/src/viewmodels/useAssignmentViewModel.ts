import { useState, useCallback } from 'react';
import { apiClient } from '../models/api';
import type { Assignment, User } from '../models/api';

export const useAssignmentViewModel = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<Assignment[]>('/assignments');
      setAssignments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudentAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<Assignment[]>('/assignments/student');
      setAssignments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your assignments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<User[]>('/users/students');
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignBook = async (studentId: number, bookId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post<Assignment>('/assignments', {
        studentId,
        bookId,
      });
      setAssignments((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      const errMsg = Array.isArray(serverMessage) ? serverMessage[0] : (serverMessage || 'Failed to assign book');
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAssignment = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.delete(`/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to delete assignment';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignments,
    students,
    isLoading,
    error,
    fetchAssignments,
    fetchStudentAssignments,
    fetchStudents,
    assignBook,
    deleteAssignment,
  };
};
