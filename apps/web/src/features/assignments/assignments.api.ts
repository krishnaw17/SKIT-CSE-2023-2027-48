import apiClient from '../../lib/api';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  passingScore: number;
  allowLate: boolean;
  latePenaltyPct: number;
  xpReward: number;
  instructions: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  attachmentUrls: string[];
  course?: { title: string };
  mySubmission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'LATE';
  textContent: string | null;
  fileUrls: string[];
  score: number | null;
  feedback: string | null;
  xpAwarded: number;
  isLate: boolean;
  submittedAt: string;
  gradedAt: string | null;
}

export const getAssignments = async (courseId: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Assignment[] }>(`/courses/${courseId}/assignments`);
  return data.data;
};

export const getAssignmentById = async (courseId: string, id: string) => {
  const { data } = await apiClient.get<{ success: boolean; data: Assignment }>(`/courses/${courseId}/assignments/${id}`);
  return data.data;
};

// Teacher API endpoints
export const createAssignment = async (courseId: string, payload: any) => {
  // If there are files, we would use FormData. But for a simple modal without files initially, we can just post JSON.
  // Wait, backend expects upload.array('files', 5) in createAssignment routes, so it accepts multipart/form-data.
  // We will always send FormData to match backend expectations even if files are empty.
  const formData = new FormData();
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      if (key === 'files') {
        payload[key].forEach((file: File) => formData.append('files', file));
      } else {
        formData.append(key, payload[key].toString());
      }
    }
  });

  const { data } = await apiClient.post<{ success: boolean; data: Assignment }>(
    `/courses/${courseId}/assignments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
};

export const updateAssignment = async (courseId: string, id: string, payload: any) => {
  const formData = new FormData();
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      if (key === 'files') {
        payload[key].forEach((file: File) => formData.append('files', file));
      } else if (Array.isArray(payload[key])) {
        if (payload[key].length === 0) {
          formData.append(key, '');
        } else {
          payload[key].forEach((val: any) => formData.append(key, val.toString()));
        }
      } else {
        formData.append(key, payload[key].toString());
      }
    }
  });

  const { data } = await apiClient.patch<{ success: boolean; data: Assignment }>(
    `/courses/${courseId}/assignments/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
};

export const deleteAssignment = async (courseId: string, id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${courseId}/assignments/${id}`);
  return data.data;
};

// Student API endpoints
export const submitAssignment = async (courseId: string, id: string, textContent?: string, files?: File[]) => {
  const formData = new FormData();
  if (textContent) formData.append('textContent', textContent);
  if (files) {
    files.forEach((file) => formData.append('files', file));
  }

  const { data } = await apiClient.post<{ success: boolean; data: AssignmentSubmission }>(
    `/courses/${courseId}/assignments/${id}/submissions`, 
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.data;
};

export const unsubmitAssignment = async (courseId: string, id: string) => {
  const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/courses/${courseId}/assignments/${id}/submissions`);
  return data.data;
};

export const gradeSubmission = async (courseId: string, assignmentId: string, submissionId: string, score: number, feedback?: string) => {
  const { data } = await apiClient.patch<{ success: boolean; data: any }>(
    `/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    { score, feedback }
  );
  return data.data;
};
