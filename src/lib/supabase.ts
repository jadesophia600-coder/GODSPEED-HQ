import { createClient } from '@supabase/supabase-js';
import { 
  Member, 
  Office, 
  PVSubmission, 
  DuesRecord, 
  AttendanceRecord, 
  EarningsRecord, 
  HealthMetric, 
  ActivityItem,
  GenealogyNode,
  Notification
} from '../types';

// Read env variables or fallback gracefully
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-godspeed-hq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-godspeed-hq-2026';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// SEEDED PRODUCTION DATASTORE (FALLBACK & SEED)
// ==========================================

export const SEEDED_CURRENT_USER: Member = {
  id: 'usr-001',
  member_id: 'GSD-9901',
  full_name: 'Marcus Vance',
  email: 'm.vance@godspeedhq.com',
  phone: '+1 (555) 382-9901',
  role: 'super_admin',
  rank: 'Diamond Executive',
  office_id: 'off-01',
  office_name: 'Global HQ — London',
  status: 'ACTIVE',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  join_date: '2022-01-15',
  pv_total: 14850,
  earnings_ytd: 184500,
  health_score: 94,
  downline_count: 342
};

export const SEEDED_OFFICES: Office[] = [
  {
    id: 'off-01',
    name: 'Global HQ — London',
    code: 'LON-01',
    location: 'Mayfair Executive Tower',
    city: 'London',
    country: 'United Kingdom',
    member_count: 420,
    attendance_rate: 94.2,
    dues_collected: 124500,
    total_pv: 342000,
    performance_score: 98,
    manager_name: 'Eleanor Sterling',
    established_year: 2019
  },
  {
    id: 'off-02',
    name: 'Americas Hub — New York',
    code: 'NYC-01',
    location: '730 5th Avenue, Manhattan',
    city: 'New York',
    country: 'United States',
    member_count: 380,
    attendance_rate: 91.8,
    dues_collected: 98400,
    total_pv: 289000,
    performance_score: 95,
    manager_name: 'David K. Ross',
    established_year: 2020
  },
  {
    id: 'off-03',
    name: 'APAC Region — Singapore',
    code: 'SGP-01',
    location: 'Marina Bay Financial Centre',
    city: 'Singapore',
    country: 'Singapore',
    member_count: 290,
    attendance_rate: 96.5,
    dues_collected: 87200,
    total_pv: 265000,
    performance_score: 96,
    manager_name: 'Mei Ling Tan',
    established_year: 2021
  },
  {
    id: 'off-04',
    name: 'EMEA Hub — Zurich',
    code: 'ZRH-01',
    location: 'Bahnhofstrasse 45',
    city: 'Zurich',
    country: 'Switzerland',
    member_count: 158,
    attendance_rate: 89.4,
    dues_collected: 45000,
    total_pv: 178000,
    performance_score: 92,
    manager_name: 'Adrian von Berg',
    established_year: 2022
  }
];

export const SEEDED_MEMBERS: Member[] = [
  SEEDED_CURRENT_USER,
  {
    id: 'usr-002',
    member_id: 'GSD-8802',
    full_name: 'Eleanor Sterling',
    email: 'e.sterling@godspeedhq.com',
    phone: '+44 20 7946 0912',
    role: 'regional_manager',
    rank: 'Gold Regional Lead',
    office_id: 'off-01',
    office_name: 'Global HQ — London',
    status: 'ACTIVE',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    join_date: '2022-03-10',
    sponsor_id: 'usr-001',
    sponsor_name: 'Marcus Vance',
    pv_total: 9200,
    earnings_ytd: 96500,
    health_score: 91,
    downline_count: 128
  },
  {
    id: 'usr-003',
    member_id: 'GSD-7703',
    full_name: 'David K. Ross',
    email: 'd.ross@godspeedhq.com',
    phone: '+1 212 555 0192',
    role: 'regional_manager',
    rank: 'Gold Regional Lead',
    office_id: 'off-02',
    office_name: 'Americas Hub — New York',
    status: 'ACTIVE',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    join_date: '2022-05-18',
    sponsor_id: 'usr-001',
    sponsor_name: 'Marcus Vance',
    pv_total: 8400,
    earnings_ytd: 84200,
    health_score: 88,
    downline_count: 94
  },
  {
    id: 'usr-004',
    member_id: 'GSD-6604',
    full_name: 'Sophia Chen',
    email: 's.chen@godspeedhq.com',
    phone: '+65 6789 0123',
    role: 'member',
    rank: 'Silver Team Lead',
    office_id: 'off-03',
    office_name: 'APAC Region — Singapore',
    status: 'ACTIVE',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    join_date: '2023-01-22',
    sponsor_id: 'usr-002',
    sponsor_name: 'Eleanor Sterling',
    pv_total: 5100,
    earnings_ytd: 48900,
    health_score: 85,
    downline_count: 42
  },
  {
    id: 'usr-005',
    member_id: 'GSD-5505',
    full_name: 'Alexander Wright',
    email: 'a.wright@godspeedhq.com',
    phone: '+44 20 7946 0881',
    role: 'member',
    rank: 'Silver Team Lead',
    office_id: 'off-01',
    office_name: 'Global HQ — London',
    status: 'ACTIVE',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    join_date: '2023-04-14',
    sponsor_id: 'usr-002',
    sponsor_name: 'Eleanor Sterling',
    pv_total: 4800,
    earnings_ytd: 42300,
    health_score: 90,
    downline_count: 36
  },
  {
    id: 'usr-006',
    member_id: 'GSD-4406',
    full_name: 'Beatrice Lawson',
    email: 'b.lawson@godspeedhq.com',
    phone: '+1 212 555 0451',
    role: 'member',
    rank: 'Bronze Associate',
    office_id: 'off-02',
    office_name: 'Americas Hub — New York',
    status: 'PENDING',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    join_date: '2024-02-10',
    sponsor_id: 'usr-003',
    sponsor_name: 'David K. Ross',
    pv_total: 1250,
    earnings_ytd: 12400,
    health_score: 76,
    downline_count: 12
  },
  {
    id: 'usr-007',
    member_id: 'GSD-3307',
    full_name: 'Julian Thorne',
    email: 'j.thorne@godspeedhq.com',
    phone: '+41 44 211 4099',
    role: 'member',
    rank: 'Member',
    office_id: 'off-04',
    office_name: 'EMEA Hub — Zurich',
    status: 'ACTIVE',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    join_date: '2024-06-01',
    sponsor_id: 'usr-005',
    sponsor_name: 'Alexander Wright',
    pv_total: 850,
    earnings_ytd: 6200,
    health_score: 82,
    downline_count: 5
  }
];

export const SEEDED_PV_SUBMISSIONS: PVSubmission[] = [
  {
    id: 'pv-101',
    member_id: 'usr-004',
    member_name: 'Sophia Chen',
    office_name: 'APAC Region — Singapore',
    pv_amount: 1450,
    submission_date: '2026-10-01',
    product_category: 'Enterprise Vitality Packs',
    receipt_ref: 'REC-2026-9812',
    status: 'APPROVED',
    approver_note: 'Verified against inventory ledger.'
  },
  {
    id: 'pv-102',
    member_id: 'usr-005',
    member_name: 'Alexander Wright',
    office_name: 'Global HQ — London',
    pv_amount: 2200,
    submission_date: '2026-10-02',
    product_category: 'Corporate Wellness System',
    receipt_ref: 'REC-2026-9890',
    status: 'PENDING',
    approver_note: 'Awaiting regional manager signature'
  },
  {
    id: 'pv-103',
    member_id: 'usr-006',
    member_name: 'Beatrice Lawson',
    office_name: 'Americas Hub — New York',
    pv_amount: 850,
    submission_date: '2026-09-28',
    product_category: 'Executive Health Kit',
    receipt_ref: 'REC-2026-9743',
    status: 'APPROVED',
    approver_note: 'Auto-cleared by system threshold.'
  },
  {
    id: 'pv-104',
    member_id: 'usr-007',
    member_name: 'Julian Thorne',
    office_name: 'EMEA Hub — Zurich',
    pv_amount: 450,
    submission_date: '2026-09-25',
    product_category: 'Nutraceutical Line A',
    receipt_ref: 'REC-2026-9650',
    status: 'REJECTED',
    approver_note: 'Duplicate receipt reference code.'
  }
];

export const SEEDED_DUES: DuesRecord[] = [
  {
    id: 'due-201',
    member_id: 'usr-002',
    member_name: 'Eleanor Sterling',
    office_name: 'Global HQ — London',
    month_year: 'October 2026',
    amount: 150,
    due_date: '2026-10-05',
    status: 'COMPLETED',
    payment_method: 'Corporate Direct Debit'
  },
  {
    id: 'due-202',
    member_id: 'usr-003',
    member_name: 'David K. Ross',
    office_name: 'Americas Hub — New York',
    month_year: 'October 2026',
    amount: 150,
    due_date: '2026-10-05',
    status: 'COMPLETED',
    payment_method: 'Visa Corporate ****9012'
  },
  {
    id: 'due-203',
    member_id: 'usr-004',
    member_name: 'Sophia Chen',
    office_name: 'APAC Region — Singapore',
    month_year: 'October 2026',
    amount: 150,
    due_date: '2026-10-05',
    status: 'PENDING',
    payment_method: 'Pending Invoice'
  },
  {
    id: 'due-204',
    member_id: 'usr-006',
    member_name: 'Beatrice Lawson',
    office_name: 'Americas Hub — New York',
    month_year: 'September 2026',
    amount: 150,
    due_date: '2026-09-05',
    status: 'PENDING',
    payment_method: 'Overdue Notice Sent'
  }
];

export const SEEDED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-301',
    member_id: 'usr-001',
    member_name: 'Marcus Vance',
    office_id: 'off-01',
    office_name: 'Global HQ — London',
    date: '2026-10-02',
    check_in_time: '08:45 AM',
    event_type: 'Weekly Leadership Summit',
    status: 'ACTIVE'
  },
  {
    id: 'att-302',
    member_id: 'usr-002',
    member_name: 'Eleanor Sterling',
    office_id: 'off-01',
    office_name: 'Global HQ — London',
    date: '2026-10-02',
    check_in_time: '08:52 AM',
    event_type: 'Weekly Leadership Summit',
    status: 'ACTIVE'
  },
  {
    id: 'att-303',
    member_id: 'usr-004',
    member_name: 'Sophia Chen',
    office_id: 'off-03',
    office_name: 'APAC Region — Singapore',
    date: '2026-10-01',
    check_in_time: '09:10 AM',
    event_type: 'APAC Strategy Briefing',
    status: 'ACTIVE'
  },
  {
    id: 'att-304',
    member_id: 'usr-006',
    member_name: 'Beatrice Lawson',
    office_id: 'off-02',
    office_name: 'Americas Hub — New York',
    date: '2026-09-30',
    check_in_time: '10:15 AM',
    event_type: 'Regional Team Huddle',
    status: 'EXCUSED'
  }
];

export const SEEDED_EARNINGS: EarningsRecord[] = [
  {
    id: 'ern-401',
    member_id: 'usr-001',
    member_name: 'Marcus Vance',
    period: 'Q3 2026',
    base_commission: 45000,
    volume_bonus: 18500,
    leadership_override: 12000,
    total_amount: 75500,
    status: 'COMPLETED'
  },
  {
    id: 'ern-402',
    member_id: 'usr-002',
    member_name: 'Eleanor Sterling',
    period: 'Q3 2026',
    base_commission: 24000,
    volume_bonus: 9800,
    leadership_override: 4500,
    total_amount: 38300,
    status: 'COMPLETED'
  },
  {
    id: 'ern-403',
    member_id: 'usr-003',
    member_name: 'David K. Ross',
    period: 'Q3 2026',
    base_commission: 21500,
    volume_bonus: 8200,
    leadership_override: 3900,
    total_amount: 33600,
    status: 'COMPLETED'
  },
  {
    id: 'ern-404',
    member_id: 'usr-004',
    member_name: 'Sophia Chen',
    period: 'Q3 2026',
    base_commission: 14200,
    volume_bonus: 4100,
    leadership_override: 1200,
    total_amount: 19500,
    status: 'COMPLETED'
  }
];

export const SEEDED_HEALTH_METRICS: HealthMetric[] = [
  {
    id: 'hlth-501',
    member_id: 'usr-001',
    member_name: 'Marcus Vance',
    vitality_score: 94,
    activity_index: 98,
    retention_risk: 'LOW',
    engagement_grade: 'A+',
    last_assessment_date: '2026-09-28'
  },
  {
    id: 'hlth-502',
    member_id: 'usr-002',
    member_name: 'Eleanor Sterling',
    vitality_score: 91,
    activity_index: 92,
    retention_risk: 'LOW',
    engagement_grade: 'A+',
    last_assessment_date: '2026-09-30'
  },
  {
    id: 'hlth-503',
    member_id: 'usr-004',
    member_name: 'Sophia Chen',
    vitality_score: 85,
    activity_index: 86,
    retention_risk: 'LOW',
    engagement_grade: 'A',
    last_assessment_date: '2026-09-29'
  },
  {
    id: 'hlth-504',
    member_id: 'usr-006',
    member_name: 'Beatrice Lawson',
    vitality_score: 76,
    activity_index: 68,
    retention_risk: 'MEDIUM',
    engagement_grade: 'B',
    last_assessment_date: '2026-09-15'
  }
];

export const SEEDED_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-01',
    type: 'pv_submitted',
    title: 'New PV Submission',
    description: 'Alexander Wright submitted 2,200 PV for Corporate Wellness System',
    timestamp: '12 minutes ago',
    user_name: 'Alexander Wright',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    status: 'PENDING'
  },
  {
    id: 'act-02',
    type: 'attendance_recorded',
    title: 'Leadership Summit Check-in',
    description: 'Marcus Vance & Eleanor Sterling checked into Weekly Leadership Summit',
    timestamp: '1 hour ago',
    user_name: 'Marcus Vance',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: 'ACTIVE'
  },
  {
    id: 'act-03',
    type: 'member_registered',
    title: 'New Member Onboarded',
    description: 'Julian Thorne joined EMEA Hub — Zurich under Alexander Wright',
    timestamp: '4 hours ago',
    user_name: 'Julian Thorne',
    user_avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    status: 'APPROVED'
  },
  {
    id: 'act-04',
    type: 'payment_received',
    title: 'Executive Dues Processed',
    description: 'David K. Ross completed Q4 regional administrative dues ($150)',
    timestamp: 'Yesterday',
    user_name: 'David K. Ross',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'COMPLETED'
  }
];

export const SEEDED_GENEALOGY: GenealogyNode = {
  id: 'usr-001',
  member_id: 'GSD-9901',
  name: 'Marcus Vance',
  rank: 'Diamond Executive',
  role: 'super_admin',
  office: 'Global HQ — London',
  pv: 14850,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  status: 'ACTIVE',
  level: 1,
  children: [
    {
      id: 'usr-002',
      member_id: 'GSD-8802',
      name: 'Eleanor Sterling',
      rank: 'Gold Regional Lead',
      role: 'regional_manager',
      office: 'Global HQ — London',
      pv: 9200,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
      level: 2,
      children: [
        {
          id: 'usr-004',
          member_id: 'GSD-6604',
          name: 'Sophia Chen',
          rank: 'Silver Team Lead',
          role: 'member',
          office: 'APAC Region — Singapore',
          pv: 5100,
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
          status: 'ACTIVE',
          level: 3
        },
        {
          id: 'usr-005',
          member_id: 'GSD-5505',
          name: 'Alexander Wright',
          rank: 'Silver Team Lead',
          role: 'member',
          office: 'Global HQ — London',
          pv: 4800,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          status: 'ACTIVE',
          level: 3,
          children: [
            {
              id: 'usr-007',
              member_id: 'GSD-3307',
              name: 'Julian Thorne',
              rank: 'Member',
              role: 'member',
              office: 'EMEA Hub — Zurich',
              pv: 850,
              avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
              status: 'ACTIVE',
              level: 4
            }
          ]
        }
      ]
    },
    {
      id: 'usr-003',
      member_id: 'GSD-7703',
      name: 'David K. Ross',
      rank: 'Gold Regional Lead',
      role: 'regional_manager',
      office: 'Americas Hub — New York',
      pv: 8400,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
      level: 2,
      children: [
        {
          id: 'usr-006',
          member_id: 'GSD-4406',
          name: 'Beatrice Lawson',
          rank: 'Bronze Associate',
          role: 'member',
          office: 'Americas Hub — New York',
          pv: 1250,
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          status: 'PENDING',
          level: 3
        }
      ]
    }
  ]
};

export const SEEDED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-01',
    title: 'PV Submission Approved',
    message: 'Your 1,450 PV submission for Enterprise Vitality Packs has been approved.',
    timestamp: '10m ago',
    read: false,
    type: 'gold'
  },
  {
    id: 'notif-02',
    title: 'Weekly Summit Reminder',
    message: 'Global Leadership Summit starts tomorrow at 09:00 AM BST.',
    timestamp: '1h ago',
    read: false,
    type: 'info'
  },
  {
    id: 'notif-03',
    title: 'Monthly Dues Receipt',
    message: 'Receipt issued for October 2026 administrative dues.',
    timestamp: '1d ago',
    read: true,
    type: 'success'
  }
];
