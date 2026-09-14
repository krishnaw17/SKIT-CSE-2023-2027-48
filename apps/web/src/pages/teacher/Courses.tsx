import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses, createCourse } from '@/features/courses/courses.api';
import { getSubjects, getClasses, createSubject } from '@/features/shared/shared.api';
import { useAuthStore } from '@/stores/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Clock, Users, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/PageLoader';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

export default function TeacherCoursesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subjectId: '', classId: '', description: '', estimatedHours: '' });
  
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', 'teacher', user?.id],
    queryFn: () => getCourses(user?.id ? { teacherId: user.id } : {}),
    enabled: !!user?.id
  });

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: getSubjects });
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: getClasses });

  const createSubjectMutation = useMutation({
    mutationFn: () => createSubject(newSubject),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setFormData(prev => ({ ...prev, subjectId: data.id }));
      setIsCreatingSubject(false);
      setNewSubject({ name: '', code: '' });
      toast.success('Subject created successfully');
    },
    onError: () => toast.error('Failed to create subject')
  });

  const createMutation = useMutation({
    mutationFn: () => createCourse({ 
      ...formData, 
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      ...(user?.id ? { teacherId: user.id } : {})
    }),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowCreateModal(false);
      navigate(`/teacher/courses/${newCourse.id}/edit`);
    }
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      
      <div className="page-wrapper page-container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">My Courses</h1>
            <p className="text-slate-500">Manage your course materials, video lectures, and documents.</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        </div>

        {courses?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Courses Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't created any courses yet. Start by creating your first course and adding some video lectures.</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Course</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map(course => (
              <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <BookOpen className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={clsx("px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md", course.isPublished ? "bg-emerald-500/90 text-white" : "bg-slate-800/80 text-white")}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-1 text-xs font-bold tracking-wider text-primary uppercase">
                    {course.subject?.name}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{course.description || "No description provided."}</p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{course.estimatedHours ? `${course.estimatedHours}h` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{course._count?.lessons || 0} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{course._count?.enrollments || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}>
                      <Edit3 className="w-4 h-4 mr-2" /> Edit Course
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-heading">Create New Course</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Course Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  placeholder="e.g. Advanced Physics 101"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold">Subject</label>
                  {!isCreatingSubject && (
                    <button type="button" onClick={() => setIsCreatingSubject(true)} className="text-xs text-primary font-bold hover:underline">
                      + Add New Subject
                    </button>
                  )}
                </div>
                
                {isCreatingSubject ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Subject Name</label>
                      <input type="text" placeholder="e.g. Computer Science" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Subject Code</label>
                      <input type="text" placeholder="e.g. CS101" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} className="w-full px-3 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900" />
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingSubject(false)}>Cancel</Button>
                      <Button type="button" size="sm" onClick={() => createSubjectMutation.mutate()} disabled={!newSubject.name || !newSubject.code || createSubjectMutation.isPending}>
                        {createSubjectMutation.isPending ? 'Saving...' : 'Save Subject'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <select 
                    value={formData.subjectId} 
                    onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="">Select a subject...</option>
                    {subjects?.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Target Class</label>
                <select 
                  value={formData.classId} 
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">Select a class...</option>
                  {classes?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Course Duration (Hours)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours} 
                  onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  placeholder="e.g. 10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent h-24 resize-none"
                  placeholder="Brief description of the course..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!formData.title || !formData.subjectId || !formData.classId || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create & Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
