import React, { useEffect, useState } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { useAssignmentViewModel } from '../viewmodels/useAssignmentViewModel';
import type { Assignment } from '../models/api';
import {
  BookOpen,
  LogOut,
  Calendar,
  User as UserIcon,
  BookMarked,
  X,
  Eye,
} from 'lucide-react';

export const StudentDashboardView: React.FC = () => {
  const { user, logout } = useAuthViewModel();
  const { assignments, isLoading, error, fetchStudentAssignments } = useAssignmentViewModel();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  useEffect(() => {
    fetchStudentAssignments();
  }, [fetchStudentAssignments]);

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
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                Student Area
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">Welcome, {user?.username}</p>
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
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Your Reading List</h2>
          <p className="text-slate-400 mt-1">Review the materials assigned to you by your teachers.</p>
        </div>

        {/* Assignments Content */}
        {isLoading && assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p>Fetching your books catalog...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-900 rounded-3xl bg-slate-900/10 text-slate-500 text-center px-4">
            <BookMarked className="w-16 h-16 text-slate-800 mb-4" />
            <h3 className="text-lg font-bold text-slate-400 mb-1">No Books Assigned Yet</h3>
            <p className="max-w-sm text-sm">Once a teacher assigns a book to you, it will show up here immediately.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/85 rounded-2xl overflow-hidden transition-all flex flex-col group shadow-md"
              >
                <div className="aspect-[3/4] bg-slate-950 relative overflow-hidden">
                  <img
                    src={`${backendUrl}${assignment.book.coverImage}`}
                    alt={assignment.book.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {assignment.book.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                      {assignment.book.description}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2 border-t border-slate-950 mt-5 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Assigned {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>By {assignment.assignedBy.username}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="mt-3 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Book</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: Read Book Details */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col md:flex-row">
              
              {/* Left Column: Cover Image */}
              <div className="md:w-[30%] aspect-[3/4] md:aspect-auto bg-slate-950 relative border-b md:border-b-0 md:border-r border-slate-800">
                <img
                  src={`${backendUrl}${selectedAssignment.book.coverImage}`}
                  alt={selectedAssignment.book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop';
                  }}
                />
              </div>

              {/* Right Column: Book Details */}
              <div className="md:w-[70%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">{selectedAssignment.book.title}</h3>
                    <button
                      onClick={() => setSelectedAssignment(null)}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors ml-4 shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-slate-950/50 border border-slate-950 flex flex-col space-y-2 mb-8 text-sm sm:text-base text-slate-400">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      <span>Assigned by: <strong className="text-slate-300">{selectedAssignment.assignedBy.username}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Assignment Date: <strong className="text-slate-300">{new Date(selectedAssignment.assignedAt).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Description</h5>
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed overflow-y-auto max-h-[300px] pr-2">
                    {selectedAssignment.book.description}
                  </p>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-semibold shadow-lg shadow-indigo-950/40 transition-colors"
                  >
                    Close
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
export default StudentDashboardView;
