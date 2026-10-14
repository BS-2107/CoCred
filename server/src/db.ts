import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  AcademicRecord,
  AttendanceRecord,
  Certificate,
  VerificationReview,
  Achievement,
  Project,
  Internship,
  Notification,
  AuditLog
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'cocred.json');

export interface DatabaseSchema {
  users: User[];
  student_profiles: StudentProfile[];
  academic_records: AcademicRecord[];
  attendance_records: AttendanceRecord[];
  certificates: Certificate[];
  verification_reviews: VerificationReview[];
  achievements: Achievement[];
  projects: Project[];
  internships: Internship[];
  notifications: Notification[];
  audit_logs: AuditLog[];
  departments: string[];
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading data file, reinitializing default data:', err);
      }
    }

    const initialData = this.generateSeedData();
    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  private generateSeedData(): DatabaseSchema {
    const passwordHash = bcrypt.hashSync('password123', 10);

    const studentId = 'c1a7e28b-6c4a-4789-9a2f-1e920d320001';
    const student2Id = 'c1a7e28b-6c4a-4789-9a2f-1e920d320002';
    const facultyId = 'f2b8f39c-7d5b-4890-ab30-2fa31e430001';
    const placementId = 'p3c9a40d-8e6c-4901-bc41-3ab42f540001';
    const adminId = 'a4d0b51e-9f7d-4012-cd52-4bc53a650001';

    const cert1Id = 'e5e1c62f-0a8e-4123-de63-5cd64b760001';
    const cert2Id = 'e5e1c62f-0a8e-4123-de63-5cd64b760002';
    const cert3Id = 'e5e1c62f-0a8e-4123-de63-5cd64b760003';

    const users: User[] = [
      {
        id: studentId,
        email: 'student@cocred.edu',
        password_hash: passwordHash,
        full_name: 'Arjun Mehta',
        role: 'student',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        phone: '+91 98765 43210',
        department: 'Computer Science and Engineering',
        roll_number: '21BCSE104',
        graduation_year: 2025,
        created_at: new Date('2024-01-10').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: student2Id,
        email: 'student2@cocred.edu',
        password_hash: passwordHash,
        full_name: 'Sneha Rao',
        role: 'student',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        phone: '+91 98765 43211',
        department: 'Electronics & Communication',
        roll_number: '21BECE042',
        graduation_year: 2025,
        created_at: new Date('2024-02-15').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: facultyId,
        email: 'faculty@cocred.edu',
        password_hash: passwordHash,
        full_name: 'Dr. Ramesh Sharma',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
        phone: '+91 94440 12345',
        department: 'Computer Science and Engineering',
        created_at: new Date('2023-08-01').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: placementId,
        email: 'placement@cocred.edu',
        password_hash: passwordHash,
        full_name: 'Priya Nair',
        role: 'placement_officer',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        phone: '+91 98880 54321',
        department: 'Training and Placement Cell',
        created_at: new Date('2023-07-15').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: adminId,
        email: 'admin@cocred.edu',
        password_hash: passwordHash,
        full_name: 'Prof. Vikram Malhotra',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        phone: '+91 99999 00000',
        department: 'Academic Administration',
        created_at: new Date('2023-06-01').toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const student_profiles: StudentProfile[] = [
      {
        user_id: studentId,
        bio: 'Pre-final year Computer Science undergraduate passionate about Distributed Systems, Full-Stack Development, and Cloud Architecture. Active open-source contributor and hackathon enthusiast.',
        cgpa: 8.85,
        semester: 6,
        linkedin_url: 'https://linkedin.com/in/arjun-mehta-dev',
        github_url: 'https://github.com/arjunmehta',
        portfolio_slug: 'arjun-mehta',
        is_public: true,
        skills: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Python', 'Tailwind CSS', 'System Design'],
        contact_email: 'arjun.mehta@alumni.edu',
        phone_number: '+91 98765 43210',
        resume_url: '/uploads/sample-resume.pdf',
        created_at: new Date('2024-01-10').toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: student2Id,
        bio: 'Electronics & Communication engineering student specializing in Embedded Systems, IoT architecture, and Edge AI applications.',
        cgpa: 9.12,
        semester: 6,
        linkedin_url: 'https://linkedin.com/in/sneha-rao-ece',
        github_url: 'https://github.com/sneharao',
        portfolio_slug: 'sneha-rao',
        is_public: true,
        skills: ['C/C++', 'Embedded C', 'Python', 'RTOS', 'ARM Cortex', 'TensorFlow Lite', 'PCB Design', 'MQTT'],
        contact_email: 'sneha.rao@alumni.edu',
        created_at: new Date('2024-02-15').toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const academic_records: AcademicRecord[] = [
      {
        id: 'ar-01',
        user_id: studentId,
        semester: 5,
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        credits: 4.0,
        grade: 'A+',
        sgpa: 9.10,
        academic_year: '2023-2024',
        created_at: new Date('2023-12-20').toISOString()
      },
      {
        id: 'ar-02',
        user_id: studentId,
        semester: 5,
        course_code: 'CS502',
        course_name: 'Design and Analysis of Algorithms',
        credits: 4.0,
        grade: 'A',
        sgpa: 9.10,
        academic_year: '2023-2024',
        created_at: new Date('2023-12-20').toISOString()
      },
      {
        id: 'ar-03',
        user_id: studentId,
        semester: 5,
        course_code: 'CS503',
        course_name: 'Computer Networks',
        credits: 3.0,
        grade: 'A+',
        sgpa: 9.10,
        academic_year: '2023-2024',
        created_at: new Date('2023-12-20').toISOString()
      },
      {
        id: 'ar-04',
        user_id: studentId,
        semester: 4,
        course_code: 'CS401',
        course_name: 'Operating Systems & Concurrency',
        credits: 4.0,
        grade: 'A',
        sgpa: 8.75,
        academic_year: '2022-2023',
        created_at: new Date('2023-05-20').toISOString()
      },
      {
        id: 'ar-05',
        user_id: studentId,
        semester: 4,
        course_code: 'CS402',
        course_name: 'Software Engineering Principles',
        credits: 3.0,
        grade: 'O',
        sgpa: 8.75,
        academic_year: '2022-2023',
        created_at: new Date('2023-05-20').toISOString()
      }
    ];

    const attendance_records: AttendanceRecord[] = [
      {
        id: 'att-01',
        user_id: studentId,
        semester: 6,
        course_code: 'CS601',
        course_name: 'Cloud Computing Architecture',
        total_classes: 48,
        attended_classes: 44,
        percentage: 91.67,
        updated_at: new Date().toISOString()
      },
      {
        id: 'att-02',
        user_id: studentId,
        semester: 6,
        course_code: 'CS602',
        course_name: 'Artificial Intelligence & Machine Learning',
        total_classes: 45,
        attended_classes: 41,
        percentage: 91.11,
        updated_at: new Date().toISOString()
      },
      {
        id: 'att-03',
        user_id: studentId,
        semester: 6,
        course_code: 'CS603',
        course_name: 'Compiler Design',
        total_classes: 40,
        attended_classes: 34,
        percentage: 85.00,
        updated_at: new Date().toISOString()
      },
      {
        id: 'att-04',
        user_id: studentId,
        semester: 6,
        course_code: 'CS604',
        course_name: 'Information & Cyber Security',
        total_classes: 36,
        attended_classes: 26,
        percentage: 72.22, // Flagged below 75%
        updated_at: new Date().toISOString()
      }
    ];

    const certificates: Certificate[] = [
      {
        id: cert1Id,
        user_id: studentId,
        title: 'AWS Certified Cloud Practitioner (CLF-C02)',
        issuing_org: 'Amazon Web Services',
        issue_date: '2023-11-15',
        expiry_date: '2026-11-15',
        credential_id: 'AWS-CCP-984210',
        credential_url: 'https://aws.amazon.com/verification',
        file_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=1200',
        file_name: 'AWS_Certified_Cloud_Practitioner.pdf',
        file_size: 1420000,
        category: 'Industry Certification',
        description: 'Demonstrated overall understanding of cloud concepts, security, technology, billing, and pricing models.',
        status: 'approved',
        verified_by: facultyId,
        verified_at: new Date('2023-11-20T10:30:00Z').toISOString(),
        created_at: new Date('2023-11-18').toISOString(),
        updated_at: new Date('2023-11-20').toISOString()
      },
      {
        id: cert2Id,
        user_id: studentId,
        title: 'Deep Learning Specialization',
        issuing_org: 'DeepLearning.AI / Coursera',
        issue_date: '2024-02-28',
        credential_id: 'COURSERA-DL-7731',
        credential_url: 'https://coursera.org/verify/specialization',
        file_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
        file_name: 'Deep_Learning_Specialization.pdf',
        file_size: 2150000,
        category: 'Technical Course',
        description: 'Comprehensive 5-course sequence covering Neural Networks, CNNs, Sequence Models, and Hyperparameter Tuning.',
        status: 'pending',
        created_at: new Date('2024-03-01').toISOString(),
        updated_at: new Date('2024-03-01').toISOString()
      },
      {
        id: cert3Id,
        user_id: studentId,
        title: 'FreeCodeCamp Responsive Web Design',
        issuing_org: 'freeCodeCamp',
        issue_date: '2023-04-10',
        credential_id: 'FCC-RWD-3392',
        file_url: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?auto=format&fit=crop&q=80&w=1200',
        file_name: 'FCC_Web_Design.pdf',
        file_size: 980000,
        category: 'Online Course',
        description: 'Completed 300 hours of responsive web development coursework including Flexbox, CSS Grid, and responsive layout projects.',
        status: 'rejected',
        verified_by: facultyId,
        verified_at: new Date('2023-04-15T14:20:00Z').toISOString(),
        rejection_reason: 'Please provide accredited institutional or proctored university-recognized credential with verifiable digital signature.',
        created_at: new Date('2023-04-12').toISOString(),
        updated_at: new Date('2023-04-15').toISOString()
      }
    ];

    const verification_reviews: VerificationReview[] = [
      {
        id: 'vr-01',
        certificate_id: cert1Id,
        reviewer_id: facultyId,
        reviewer_name: 'Dr. Ramesh Sharma',
        action: 'approved',
        notes: 'Official digital validation code verified via AWS verification portal. Valid till 2026.',
        created_at: new Date('2023-11-20T10:30:00Z').toISOString()
      },
      {
        id: 'vr-02',
        certificate_id: cert3Id,
        reviewer_id: facultyId,
        reviewer_name: 'Dr. Ramesh Sharma',
        action: 'rejected',
        reason: 'Please provide accredited institutional or proctored university-recognized credential with verifiable digital signature.',
        notes: 'Coursework completion badge is unproctored. Department policy requires proctored certifications.',
        created_at: new Date('2023-04-15T14:20:00Z').toISOString()
      }
    ];

    const achievements: Achievement[] = [
      {
        id: 'ach-01',
        user_id: studentId,
        title: 'Smart India Hackathon 2023 - 1st Prize Winner',
        category: 'hackathon',
        organization: 'Ministry of Education & AICTE',
        date: '2023-12-22',
        description: 'Led a team of 6 to build an automated real-time disaster management telemetry dashboard. Awarded INR 1,00,000 cash prize.',
        proof_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
        status: 'approved',
        created_at: new Date('2023-12-25').toISOString()
      },
      {
        id: 'ach-02',
        user_id: studentId,
        title: 'IEEE Research Paper Publication (Best Paper Nominee)',
        category: 'research',
        organization: 'IEEE International Conference on Advanced Computing (ICAC 2024)',
        date: '2024-02-14',
        description: 'Co-authored paper titled "Optimized Consensus Algorithms for Edge IoT Swarms". Presented in technical track.',
        proof_url: 'https://ieeexplore.ieee.org',
        status: 'approved',
        created_at: new Date('2024-02-16').toISOString()
      },
      {
        id: 'ach-03',
        user_id: studentId,
        title: 'Google Solution Challenge Global Top 100 Finalist',
        category: 'award',
        organization: 'Google Developer Student Clubs',
        date: '2023-06-10',
        description: 'Developed an accessibility application targeting UN Sustainable Development Goal 4 (Quality Education).',
        proof_url: 'https://developers.google.com/community/gdsc-solution-challenge',
        status: 'approved',
        created_at: new Date('2023-06-12').toISOString()
      }
    ];

    const projects: Project[] = [
      {
        id: 'proj-01',
        user_id: studentId,
        title: 'CoCred — Academic & Co-Curricular Credential Platform',
        description: 'Full-stack platform enabling university students to record, verify, and share academic and extracurricular credentials with faculty review workflows and verifiable public QR code portfolios.',
        tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
        github_url: 'https://github.com/arjunmehta/cocred-platform',
        live_url: 'https://cocred.edu',
        role: 'Team Lead & Full-Stack Architect',
        start_date: '2024-01-15',
        end_date: '2024-04-10',
        created_at: new Date('2024-01-20').toISOString()
      },
      {
        id: 'proj-02',
        user_id: studentId,
        title: 'Autonomous Campus Delivery Robot (Edge AI)',
        description: 'Engineered SLAM navigation system using ROS2 and LiDAR point clouds for indoor food and parcel delivery within campus buildings.',
        tech_stack: ['Python', 'ROS2', 'C++', 'OpenCV', 'LiDAR', 'Raspberry Pi'],
        github_url: 'https://github.com/arjunmehta/campus-bot-ros2',
        role: 'Perception & Navigation Engineer',
        start_date: '2023-08-01',
        end_date: '2023-11-30',
        created_at: new Date('2023-08-10').toISOString()
      }
    ];

    const internships: Internship[] = [
      {
        id: 'intern-01',
        user_id: studentId,
        company: 'Razorpay',
        role: 'Software Development Engineering Intern',
        location: 'Bangalore, India (Hybrid)',
        start_date: '2023-06-01',
        end_date: '2023-08-31',
        description: 'Built high-throughput payment webhook processing pipeline handling 10,000+ events/sec using Kafka and Go. Reduced p99 latency by 28%.',
        certificate_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
        stipend: 'INR 45,000/month',
        status: 'Completed',
        created_at: new Date('2023-09-02').toISOString()
      }
    ];

    const notifications: Notification[] = [
      {
        id: 'notif-01',
        user_id: studentId,
        title: 'Certificate Verified: AWS Cloud Practitioner',
        message: 'Your certificate has been approved by Dr. Ramesh Sharma and is now featured on your public portfolio.',
        type: 'success',
        is_read: false,
        link: '/certificates',
        created_at: new Date('2023-11-20T10:30:00Z').toISOString()
      },
      {
        id: 'notif-02',
        user_id: studentId,
        title: 'Attendance Alert: CS604 Cyber Security',
        message: 'Your current attendance in CS604 is 72.22%, which is below the mandatory 75% threshold.',
        type: 'warning',
        is_read: false,
        link: '/attendance',
        created_at: new Date().toISOString()
      }
    ];

    const audit_logs: AuditLog[] = [
      {
        id: 'audit-01',
        user_id: facultyId,
        user_name: 'Dr. Ramesh Sharma',
        action: 'CERTIFICATE_VERIFIED',
        entity_type: 'Certificate',
        entity_id: cert1Id,
        details: { title: 'AWS Certified Cloud Practitioner (CLF-C02)', student: 'Arjun Mehta' },
        ip_address: '192.168.1.45',
        created_at: new Date('2023-11-20T10:30:00Z').toISOString()
      },
      {
        id: 'audit-02',
        user_id: facultyId,
        user_name: 'Dr. Ramesh Sharma',
        action: 'CERTIFICATE_REJECTED',
        entity_type: 'Certificate',
        entity_id: cert3Id,
        details: { title: 'FreeCodeCamp Responsive Web Design', student: 'Arjun Mehta', reason: 'Unproctored certification' },
        ip_address: '192.168.1.45',
        created_at: new Date('2023-04-15T14:20:00Z').toISOString()
      }
    ];

    const departments = [
      'Computer Science and Engineering',
      'Electronics & Communication',
      'Information Technology',
      'Electrical & Electronics',
      'Mechanical Engineering',
      'Civil Engineering',
      'Data Science & AI',
      'Training and Placement Cell',
      'Academic Administration'
    ];

    return {
      users,
      student_profiles,
      academic_records,
      attendance_records,
      certificates,
      verification_reviews,
      achievements,
      projects,
      internships,
      notifications,
      audit_logs,
      departments
    };
  }
}

export const db = new Database();
