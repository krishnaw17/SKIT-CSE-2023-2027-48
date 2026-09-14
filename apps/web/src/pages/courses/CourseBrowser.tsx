import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { Course } from '../../features/courses/courses.api';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';

export default function CourseBrowser() {
  const { data: courses, isLoading } = useCourses();
  const [filter, setFilter] = useState('all'); // all, enrolled

  if (isLoading) return <PageLoader />;

  const filteredCourses = courses?.filter((course: Course) => {
    if (filter === 'enrolled') return course.isEnrolled;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Explore Courses</h1>
          <p className="text-muted-foreground mt-1">Discover new skills and level up your knowledge.</p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all',
              filter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('enrolled')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-all',
              filter === 'enrolled' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            My Enrollments
          </button>
        </div>
      </div>

      {filteredCourses?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium">No courses found</h3>
          <p className="text-muted-foreground mt-2">Check back later for new courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses?.map((course: Course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                
                {course.isEnrolled && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md bg-primary/90">
                    <Star className="w-3 h-3 fill-current" /> Enrolled
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md">
                    {course.subject?.name || 'General'}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.estimatedHours || 0}h
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                      {course.teacher?.user?.avatarUrl ? (
                         <img src={course.teacher.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (course.teacher?.user?.firstName?.[0] || 'T')
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {course.teacher?.user?.firstName} {course.teacher?.user?.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Award className="w-4 h-4" />
                    +{course.xpReward} XP
                  </div>
                </div>

                {course.isEnrolled && course.progressPercent !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold text-primary">{Math.round(course.progressPercent)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
