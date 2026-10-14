const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('cocred_token');
  }

  public setToken(token: string) {
    localStorage.setItem('cocred_token', token);
  }

  public removeToken() {
    localStorage.removeItem('cocred_token');
  }

  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Student endpoints
  async getStudentDashboard() {
    return this.request('/student/dashboard');
  }

  async getStudentProfile() {
    return this.request('/student/profile');
  }

  async updateStudentProfile(profileData: any) {
    return this.request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getCertificates() {
    return this.request('/student/certificates');
  }

  async uploadCertificate(formData: FormData) {
    return this.request('/student/certificates', {
      method: 'POST',
      body: formData
    });
  }

  async deleteCertificate(id: string) {
    return this.request(`/student/certificates/${id}`, {
      method: 'DELETE'
    });
  }

  async getAcademicRecords() {
    return this.request('/student/academic-records');
  }

  async addAcademicRecord(record: any) {
    return this.request('/student/academic-records', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  }

  async deleteAcademicRecord(id: string) {
    return this.request(`/student/academic-records/${id}`, {
      method: 'DELETE'
    });
  }

  async getAttendance() {
    return this.request('/student/attendance');
  }

  async addAttendance(record: any) {
    return this.request('/student/attendance', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  }

  async deleteAttendance(id: string) {
    return this.request(`/student/attendance/${id}`, {
      method: 'DELETE'
    });
  }

  async getAchievements() {
    return this.request('/student/achievements');
  }

  async addAchievement(data: any) {
    return this.request('/student/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteAchievement(id: string) {
    return this.request(`/student/achievements/${id}`, {
      method: 'DELETE'
    });
  }

  async getProjects() {
    return this.request('/student/projects');
  }

  async addProject(data: any) {
    return this.request('/student/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: string) {
    return this.request(`/student/projects/${id}`, {
      method: 'DELETE'
    });
  }

  async getInternships() {
    return this.request('/student/internships');
  }

  async addInternship(data: any) {
    return this.request('/student/internships', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteInternship(id: string) {
    return this.request(`/student/internships/${id}`, {
      method: 'DELETE'
    });
  }

  async getNotifications() {
    return this.request('/student/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request(`/student/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  // Faculty endpoints
  async getFacultyDashboard() {
    return this.request('/faculty/dashboard');
  }

  async getFacultySubmissions(params?: { status?: string; category?: string; department?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/faculty/submissions?${query}`);
  }

  async getFacultySubmission(id: string) {
    return this.request(`/faculty/submissions/${id}`);
  }

  async reviewCertificate(id: string, review: { action: 'approved' | 'rejected'; notes?: string; reason?: string }) {
    return this.request(`/faculty/submissions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(review)
    });
  }

  async getFacultyHistory() {
    return this.request('/faculty/history');
  }

  // Placement endpoints
  async getPlacementStudents(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/placement/students?${query}`);
  }

  async getPlacementStudentPortfolio(id: string) {
    return this.request(`/placement/students/${id}/portfolio`);
  }

  async getPlacementAnalytics() {
    return this.request('/placement/analytics');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  async provisionFaculty(data: any) {
    return this.request('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  async getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  async getAdminDepartments() {
    return this.request('/admin/departments');
  }

  async addAdminDepartment(name: string) {
    return this.request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }

  // Public endpoints
  async getPublicPortfolio(slugOrId: string) {
    return this.request(`/public/portfolio/${slugOrId}`);
  }
}

export const api = new ApiClient();
