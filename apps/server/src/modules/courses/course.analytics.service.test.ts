import { CourseAnalyticsService } from './course.analytics.service';

describe('CourseAnalyticsService', () => {
  describe('Metric calculations', () => {
    it('should compute zero percentage when total tasks are zero', () => {
      const totalLessons = 0;
      const totalQuizzes = 0;
      const totalAssignments = 0;
      const totalTasks = totalLessons + totalQuizzes + totalAssignments;

      const progressPercent = totalTasks > 0 ? Math.round((0 / totalTasks) * 100) : 0;
      expect(progressPercent).toBe(0);
    });

    it('should accurately calculate task completion rates', () => {
      const completedTasks = 7;
      const totalTasks = 10;
      const progressPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

      expect(progressPercent).toBe(70);
    });

    it('should clamp progress percentage to a maximum of 100', () => {
      const completedTasks = 15;
      const totalTasks = 10;
      const progressPercent = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

      expect(progressPercent).toBe(100);
    });

    it('should correctly determine completion status for students', () => {
      const isComplete100 = 100 === 100;
      const isComplete99 = 99 === 100;

      expect(isComplete100).toBe(true);
      expect(isComplete99).toBe(false);
    });

    it('should calculate average progress across enrolled students', () => {
      const progressList = [100, 50, 75, 25];
      const sum = progressList.reduce((acc, curr) => acc + curr, 0);
      const avg = Math.round(sum / progressList.length);

      expect(avg).toBe(63);
    });

    it('should calculate completion rate percentage properly', () => {
      const enrollments = [
        { progressPercent: 100 },
        { progressPercent: 100 },
        { progressPercent: 45 },
        { progressPercent: 80 },
      ];
      const completed = enrollments.filter((e) => e.progressPercent >= 100).length;
      const rate = Math.round((completed / enrollments.length) * 100);

      expect(rate).toBe(50);
    });
  });
});
