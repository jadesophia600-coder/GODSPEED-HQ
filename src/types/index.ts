export type UserRole = 'super_admin' | 'member';

export type BusinessStatus = 'PRO' | 'Distributors' | 'Manager' | 'Senior Manager' | 'Executive Manager' | 'Director';

export type StatusType = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'INACTIVE' | 'EXCUSED' | 'PRESENT' | 'LATE' | 'ABSENT' | 'NOT MARKED';

export interface Member {
  id: string;
  member_id: string; // e.g. GSD-1092
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  rank: BusinessStatus | string;
  office_id: string;
  office_name: string;
  status: StatusType;
  avatar_url: string;
  join_date: string;
  sponsor_id?: string;
  sponsor_name?: string;
  pv_total: number;
  earnings_ytd: number;
  health_score: number; // 0 - 100
  downline_count: number;
}

export interface Office {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  country: string;
  member_count: number;
  attendance_rate: number; // percentage
  dues_collected: number;
  total_pv: number;
  performance_score: number; // percentage
  manager_name: string;
  established_year: number;
}

export interface PVSubmission {
  id: string;
  member_id: string;
  member_name: string;
  office_name: string;
  pv_amount: number;
  submission_date: string;
  product_category: string;
  receipt_ref: string;
  status: StatusType;
  approver_note?: string;
}

export interface DuesRecord {
  id: string;
  member_id: string;
  member_name: string;
  office_name: string;
  month_year: string;
  amount: number;
  due_date: string;
  status: StatusType;
  payment_method?: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  member_name: string;
  office_id: string;
  office_name: string;
  date: string;
  check_in_time: string;
  event_type: string;
  status: StatusType;
  session_token?: string;
  created_at?: string;
}

export interface AttendanceSession {
  id: string;
  office_id: string;
  office_name: string;
  session_token: string;
  date: string;
  expires_at: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  created_by?: string;
  created_at?: string;
}

export interface AttendanceValidationResult {
  success: boolean;
  code?: 'EXPIRED' | 'INVALID_TOKEN' | 'WRONG_OFFICE' | 'ALREADY_RECORDED' | 'SUCCESS';
  message: string;
  record?: AttendanceRecord;
  session?: AttendanceSession;
  existingTime?: string;
  existingOffice?: string;
}

export interface EarningsRecord {
  id: string;
  member_id: string;
  member_name: string;
  period: string;
  base_commission: number;
  volume_bonus: number;
  leadership_override: number;
  total_amount: number;
  status: StatusType;
}

export interface HealthMetric {
  id: string;
  member_id: string;
  member_name: string;
  vitality_score: number;
  activity_index: number;
  retention_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  engagement_grade: 'A+' | 'A' | 'B' | 'C';
  last_assessment_date: string;
}

export interface ActivityItem {
  id: string;
  type: 'member_registered' | 'attendance_recorded' | 'pv_submitted' | 'payment_received' | 'profile_updated' | 'office_created';
  title: string;
  description: string;
  timestamp: string;
  user_name: string;
  user_avatar?: string;
  status?: StatusType;
}

export interface GenealogyNode {
  id: string;
  member_id: string;
  name: string;
  rank: string;
  role: UserRole;
  office: string;
  pv: number;
  avatar: string;
  status: StatusType;
  level: number;
  children?: GenealogyNode[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'gold';
}

