import React, { useState, useEffect, useRef } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { useBookViewModel } from '../viewmodels/useBookViewModel';
import { useAssignmentViewModel } from '../viewmodels/useAssignmentViewModel';
import type { Book } from '../models/api';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Share2,
  LogOut,
  X,
  Upload,
  Calendar,
  User as UserIcon,
  BookMarked,
  Info,
  CheckCircle2,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export const TeacherDashboardView: React.FC = () => {
  const { user, logout } = useAuthViewModel();
  const { books, isLoading: booksLoading, fetchBooks, createBook, updateBook, deleteBook } = useBookViewModel();
  const { assignments, students, isLoading: assignLoading, fetchAssignments, fetchStudents, assignBook, deleteAssignment } = useAssignmentViewModel();

  const [activeTab, setActiveTab] = useState<'books' | 'assignments'>('books');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'date-desc' | 'date-asc'>('date-desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [unassignTargetId, setUnassignTargetId] = useState<number | null>(null);

  // Form states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  const isAlreadyAssigned = selectedBook && selectedStudentId
    ? assignments.some(a => a.studentId === parseInt(selectedStudentId) && a.bookId === selectedBook.id)
    : false;

  useEffect(() => {
    fetchBooks();
    fetchAssignments();
    fetchStudents();
  }, [fetchBooks, fetchAssignments, fetchStudents]);

  // Click outside to close sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute filtered & sorted books list
  const filteredAndSortedBooks = books
    .filter((book) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        book.title.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      } else if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

  // Flash message handler
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerError('Selected file exceeds the 5 MB file size limit.');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Book
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !coverImage) {
      triggerError('Please fill in all fields and select a cover image');
      return;
    }
    try {
      await createBook(title, description, coverImage);
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setCoverImage(null);
      setCoverImagePreview(null);
      triggerSuccess('Book created successfully!');
    } catch (err: any) {
      triggerError(err.message || 'Failed to create book');
    }
  };

  // Open Edit Modal
  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setTitle(book.title);
    setDescription(book.description);
    setCoverImagePreview(`${backendUrl}${book.coverImage}`);
    setCoverImage(null);
    setIsEditModalOpen(true);
  };

  // Edit Book
  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    if (!title.trim() || !description.trim()) {
      triggerError('Title and description are required');
      return;
    }
    try {
      await updateBook(selectedBook.id, title, description, coverImage || undefined);
      setIsEditModalOpen(false);
      setSelectedBook(null);
      setTitle('');
      setDescription('');
      setCoverImage(null);
      setCoverImagePreview(null);
      triggerSuccess('Book updated successfully!');
    } catch (err: any) {
      triggerError(err.message || 'Failed to update book');
    }
  };

  // Delete Book
  const handleDeleteBook = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book? This will also remove any active student assignments for it.')) return;
    try {
      await deleteBook(id);
      fetchAssignments(); // Refresh assignments list
      triggerSuccess('Book deleted successfully');
    } catch (err: any) {
      triggerError(err.message || 'Failed to delete book');
    }
  };

  // Open Assign Modal
  const openAssignModal = (book: Book) => {
    setSelectedBook(book);
    setSelectedStudentId('');
    setIsAssignModalOpen(true);
  };

  // Assign Book
  const handleAssignBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedStudentId) {
      triggerError('Please select a student');
      return;
    }
    try {
      await assignBook(parseInt(selectedStudentId), selectedBook.id);
      setIsAssignModalOpen(false);
      setSelectedBook(null);
      setSelectedStudentId('');
      triggerSuccess('Book assigned successfully!');
    } catch (err: any) {
      triggerError(err.message || 'Failed to assign book (check if already assigned)');
    }
  };

  // Remove Assignment
  const handleDeleteAssignment = async (id: number) => {
    try {
      await deleteAssignment(id);
      setIsUnassignModalOpen(false);
      setUnassignTargetId(null);
      triggerSuccess('Book unassigned successfully');
    } catch (err: any) {
      triggerError(err.message || 'Failed to remove assignment');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation bar */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                LibroLink
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider">
                Teacher Panel
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">Hello, {user?.username}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center space-x-2 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Flash Notifications */}
        {successMessage && (
          <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 shadow-2xl flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-red-950/90 border border-red-500/30 text-red-200 shadow-2xl flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h2>
            <p className="text-slate-400 mt-1">Manage library materials and student readers assignments.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Book</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="border-b border-slate-900 mb-8 flex space-x-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-4 text-base font-semibold transition-all relative ${
              activeTab === 'books' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Books List ({books.length})</span>
            {activeTab === 'books' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-4 text-base font-semibold transition-all relative ${
              activeTab === 'assignments' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Active Assignments ({assignments.length})</span>
            {activeTab === 'assignments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Books Tab Content */}
        {activeTab === 'books' && (
          <div>
            {booksLoading && books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p>Loading library catalogs...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10 text-slate-500 text-center px-4">
                <BookMarked className="w-16 h-16 text-slate-800 mb-4" />
                <h3 className="text-lg font-bold text-slate-400 mb-1">Your Library is Empty</h3>
                <p className="max-w-sm mb-6 text-sm">Add educational or storybooks to the catalog so you can assign them to students.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/30 rounded-xl transition-all"
                >
                  Create First Book
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search & Sort controls bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
                  <div className="relative w-full sm:max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search books by title or description..."
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="flex items-center justify-between space-x-2 text-slate-400 bg-slate-950/40 border border-slate-800 px-3.5 py-2.5 rounded-xl text-sm w-full sm:w-auto hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer font-medium"
                    >
                      <div className="flex items-center space-x-2">
                        <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sort:</span>
                        <span className="text-slate-200">
                          {sortBy === 'title-asc' && 'Title (A-Z)'}
                          {sortBy === 'title-desc' && 'Title (Z-A)'}
                          {sortBy === 'date-desc' && 'Date Created (Newest)'}
                          {sortBy === 'date-asc' && 'Date Created (Oldest)'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('title-asc');
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortBy === 'title-asc'
                              ? 'bg-purple-600/10 text-purple-400 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-purple-400'
                          }`}
                        >
                          Title (A-Z)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('title-desc');
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortBy === 'title-desc'
                              ? 'bg-purple-600/10 text-purple-400 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-purple-400'
                          }`}
                        >
                          Title (Z-A)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('date-desc');
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortBy === 'date-desc'
                              ? 'bg-purple-600/10 text-purple-400 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-purple-400'
                          }`}
                        >
                          Date Created (Newest)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('date-asc');
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                            sortBy === 'date-asc'
                              ? 'bg-purple-600/10 text-purple-400 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-purple-400'
                          }`}
                        >
                          Date Created (Oldest)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {filteredAndSortedBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10 text-slate-500 text-center px-4">
                    <div className="p-4 bg-slate-900/40 rounded-full text-slate-600 mb-4 border border-slate-800">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 mb-1">No Books Found</h3>
                    <p className="max-w-sm mb-6 text-sm text-slate-500">No books match your search query: <span className="text-purple-400 font-semibold">"{searchQuery}"</span>.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/30 rounded-xl transition-all font-medium text-sm"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl overflow-hidden transition-all flex flex-col group shadow-md"
                      >
                        <div className="aspect-[3/4] bg-slate-950 relative overflow-hidden">
                          <img
                            src={`${backendUrl}${book.coverImage}`}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                          
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors line-clamp-1">
                              {book.title}
                            </h3>
                            <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                              {book.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-950 mt-5 pt-4">
                            <span className="text-xs text-slate-500 inline-flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                            </span>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openEditModal(book)}
                                className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-purple-400 rounded-lg transition-colors border border-slate-900"
                                title="Edit details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-900"
                                title="Delete book"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => openAssignModal(book)}
                            className="mt-3 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Assign Book</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab Content */}
        {activeTab === 'assignments' && (
          <div>
            {assignLoading && assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p>Retrieving assignments history...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10 text-slate-500 text-center px-4">
                <Share2 className="w-16 h-16 text-slate-800 mb-4" />
                <h3 className="text-lg font-bold text-slate-400 mb-1">No Active Assignments</h3>
                <p className="max-w-sm mb-6 text-sm">Assign your library books to student profiles to monitor their reading materials.</p>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Book Cover & Title</th>
                        <th className="py-4 px-6">Assigned Student</th>
                        <th className="py-4 px-6">Assigned By</th>
                        <th className="py-4 px-6">Assigned Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-sm">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-14 bg-slate-950 rounded overflow-hidden flex-shrink-0 border border-slate-900">
                                <img
                                  src={`${backendUrl}${assignment.book.coverImage}`}
                                  alt={assignment.book.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop';
                                  }}
                                />
                              </div>
                              <span className="font-bold text-slate-100">{assignment.book.title}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
                              <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                              {assignment.student?.username}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {assignment.assignedBy.username}
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => {
                                setUnassignTargetId(assignment.id);
                                setIsUnassignModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Unassign</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: Create Book */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  <span>Create New Book</span>
                </h3>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCoverImagePreview(null);
                    setCoverImage(null);
                  }}
                  className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBook} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Book Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Introduction to Physics"
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of the syllabus or book contents..."
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cover Image</label>
                  <div className="relative w-full h-48 bg-slate-950/40 border-2 border-dashed border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all group flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    
                    {coverImagePreview ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10">
                          <Upload className="w-8 h-8 text-purple-400 mb-2 transform -translate-y-1 group-hover:translate-y-0 transition-transform" />
                          <span className="text-xs font-bold text-slate-200">Click or Drag to replace cover</span>
                          <span className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center pointer-events-none p-6">
                        <Upload className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-sm font-semibold text-slate-300">Drag or click to upload cover</span>
                        <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, JPEG</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setCoverImagePreview(null);
                      setCoverImage(null);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/20 transition-all"
                  >
                    Create Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Edit Book */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Edit2 className="w-5 h-5 text-purple-400" />
                  <span>Edit Book Catalog</span>
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBook(null);
                    setCoverImagePreview(null);
                    setCoverImage(null);
                  }}
                  className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditBook} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Book Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cover Image (Optional)</label>
                  <div className="relative w-full h-48 bg-slate-950/40 border-2 border-dashed border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/40 transition-all group flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    
                    {coverImagePreview ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10">
                          <Upload className="w-8 h-8 text-purple-400 mb-2 transform -translate-y-1 group-hover:translate-y-0 transition-transform" />
                          <span className="text-xs font-bold text-slate-200">Click or Drag to replace cover</span>
                          <span className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center pointer-events-none p-6">
                        <Upload className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-sm font-semibold text-slate-300">Drag or click to upload cover</span>
                        <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, JPEG</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedBook(null);
                      setCoverImagePreview(null);
                      setCoverImage(null);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/20 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Assign Book */}
        {isAssignModalOpen && selectedBook && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="flex flex-col w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between px-10 py-6 border-b border-slate-800 flex-shrink-0">
                <h3 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <Share2 className="w-7 h-7 text-purple-400" />
                  <span>Assign Book</span>
                </h3>
                <button
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedBook(null);
                    setSelectedStudentId('');
                  }}
                  className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAssignBook} className="p-10 space-y-10 overflow-y-auto">
                
                <div className="p-6 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start space-x-5">
                  <div className="w-20 h-28 bg-slate-950 rounded border border-slate-800 overflow-hidden flex-shrink-0">
                    <img src={`${backendUrl}${selectedBook.coverImage}`} alt={selectedBook.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-slate-200 truncate">{selectedBook.title}</h4>
                    <p className="text-base text-slate-500 mt-2 leading-relaxed">{selectedBook.description}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-slate-300 uppercase tracking-wider mb-4">Select Student</label>
                  <div className="relative" ref={studentDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                      className="w-full px-6 py-5 bg-slate-950/40 border border-slate-800 rounded-xl text-lg text-left flex items-center justify-between transition-all hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <span className={selectedStudentId ? 'text-slate-200' : 'text-slate-500'}>
                        {selectedStudentId
                          ? students.find(s => s.id === parseInt(selectedStudentId))?.username || 'Choose student profile...'
                          : 'Choose student profile...'}
                      </span>
                      <ChevronDown className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isStudentDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 animate-fadeIn max-h-80 overflow-y-auto">
                        {students.length === 0 ? (
                          <div className="px-6 py-4 text-lg text-slate-500">No students registered</div>
                        ) : (
                          students.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(student.id.toString());
                                setIsStudentDropdownOpen(false);
                              }}
                              className={`w-full text-left px-6 py-4 text-lg transition-colors flex items-center justify-between ${
                                selectedStudentId === student.id.toString()
                                  ? 'bg-purple-600/10 text-purple-400 font-semibold'
                                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-purple-400'
                              }`}
                            >
                              <span className="flex items-center space-x-4">
                                <UserIcon className="w-6 h-6" />
                                <span>{student.username}</span>
                              </span>
                              {selectedStudentId === student.id.toString() && (
                                <CheckCircle2 className="w-6 h-6 text-purple-400" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {students.length === 0 && (
                    <p className="text-base text-amber-400 mt-4 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      <span>No students registered. You must have students created first.</span>
                    </p>
                  )}
                  {isAlreadyAssigned && (
                    <p className="text-base text-red-400 mt-4 flex items-center bg-red-950/20 border border-red-500/20 p-4 rounded-lg">
                      <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0 text-red-400" />
                      <span>This book is already assigned to {students.find(s => s.id === parseInt(selectedStudentId))?.username || 'this student'}.</span>
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-5 pt-8 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedBook(null);
                      setSelectedStudentId('');
                    }}
                    className="px-8 py-4 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 text-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-9 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-lg font-semibold shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50"
                    disabled={!selectedStudentId || isAlreadyAssigned}
                  >
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Unassign Confirmation */}
        {isUnassignModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span>Unassign Book</span>
                </h3>
                <button
                  onClick={() => {
                    setIsUnassignModalOpen(false);
                    setUnassignTargetId(null);
                  }}
                  className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Are you sure you want to unassign this book? The student will lose access to it.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnassignModalOpen(false);
                      setUnassignTargetId(null);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => unassignTargetId && handleDeleteAssignment(unassignTargetId)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-900/20 transition-all"
                  >
                    Yes, Unassign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
export default TeacherDashboardView;
