import { useParams, Link } from 'react-router-dom';
import { useCourse, useEnroll } from '../../hooks/useCourses';
import { BookOpen, Clock, Award, PlayCircle, FileText, Link as LinkIcon, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';
import { Button } from '../../components/common/Button';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCourse(id!);
  const enrollMutation = useEnroll();

  if (isLoading) return <PageLoader />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  const handleEnroll = () => {
    enrollMutation.mutate(course.id);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'DOCUMENT': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'LINK': return <LinkIcon className="w-5 h-5 text-green-500" />;
      default: return <BookOpen className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-up">
      <Link to="/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to courses
      </Link>

      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden mb-12 shadow-sm">
        <div className="aspect-[21/9] bg-muted relative overflow-hidden">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="w-20 h-20 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold px-3 py-1 bg-primary text-primary-foreground rounded-full shadow-lg">
                {course.subject?.name || 'General'}
              </span>
              <span className="text-sm font-medium flex items-center gap-1.5 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" /> {course.estimatedHours || 0} hours
              </span>
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 backdrop-blur-md bg-white/10 px-3 py-1 rounded-full">
                <Award className="w-4 h-4" /> +{course.xpReward} XP
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 leading-tight">{course.title}</h1>
            <p className="text-white/80 max-w-2xl text-lg md:text-xl line-clamp-2">{course.description}</p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex-grow space-y-6">
            <div>
              <h2 className="text-xl font-heading font-bold mb-3">About this course</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
            </div>
            
            <div className="flex items-center gap-4 pt-6 border-t border-border/50">
              <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden">
                {course.teacher?.user?.avatarUrl ? (
                   <img src={course.teacher.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                    {(course.teacher?.user?.firstName?.[0] || 'T')}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Taught by</p>
                <p className="font-bold text-lg">{course.teacher?.user?.firstName} {course.teacher?.user?.lastName}</p>
              </div>
            </div>
          </div>

          <div className="md:w-80 flex-shrink-0">
            <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm sticky top-24">
              <h3 className="font-heading font-bold text-lg mb-6">Course Overview</h3>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>{(course as any).lessons?.length || 0} Lessons</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{course.estimatedHours || 0} Hours of content</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Certificate & {course.xpReward} XP</span>
                </li>
              </ul>

              {course.isEnrolled ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg flex items-center gap-2 font-medium text-sm justify-center mb-4 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                    You are enrolled
                  </div>
                  
                  {course.progressPercent !== undefined && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span>Progress</span>
                        <span className="text-primary">{Math.round(course.progressPercent)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link to={`/courses/${course.id}/learn`} className="block w-full">
                    <Button variant="primary" className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                      {course.progressPercent && course.progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button 
                  variant="primary" 
                  className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now for Free'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          Course Syllabus
        </h2>
        
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm divide-y divide-border/50">
          {(course as any).lessons?.length > 0 ? (
            (course as any).lessons.map((lesson: any, index: number) => (
              <div key={lesson.id} className="p-5 sm:p-6 hover:bg-muted/30 transition-colors flex items-start gap-4 sm:gap-6">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 font-bold text-muted-foreground border border-border/50 shadow-sm">
                  {index + 1}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className="font-bold text-lg">{lesson.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md whitespace-nowrap">
                      <Award className="w-3.5 h-3.5" /> +{lesson.xpReward} XP
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{lesson.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      {getLessonIcon(lesson.type)}
                      {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()}
                    </span>
                    {lesson.duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {lesson.duration} mins
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No lessons available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
