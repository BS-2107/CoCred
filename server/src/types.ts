export type UserRole = 'student' | 'faculty' | 'placement_officer' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type AchievementCategory = 'hackathon' | 'internship' | 'research' | 'project' | 'workshop' | 'award';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  department?: string;
  roll_number?: string;
  graduation_year?: number;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  user_id: string;
  bio?: string;
  cgpa: number;
  semester: number;
  linkedin_url?: string;
  github_url?: string;
  portfolio_slug: string;
  is_public: boolean;
  skills: string[];
  contact_email?: string;
  phone_number?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicRecord {
  id: string;
  user_id: string;
  semester: number;
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
  sgpa?: number;
  academic_year: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  semester: number;
  course_code: string;
  course_name: string;
  total_classes: number;
  attended_classes: number;
  percentage: number;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuing_org: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  category: string;
  description?: string;
  status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationReview {
  id: string;
  certificate_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  action: 'approved' | 'rejected';
  notes?: string;
  reason?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  category: AchievementCategory;
  organization: string;
  date: string;
  description?: string;
  proof_url?: string;
  status: VerificationStatus;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
  thumbnail_url?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Internship {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  certificate_url?: string;
  stipend?: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
