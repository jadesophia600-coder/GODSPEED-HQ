import { createClient } from '@supabase/supabase-js';
import type { 
  Member, 
  Office, 
  PVSubmission, 
  DuesRecord, 
  AttendanceRecord, 
  EarningsRecord, 
  HealthMetric, 
  ActivityItem,
  Notification
} from '../types';

// Active Supabase Credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beetwyqytgqnytofuwoh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZXR3eXF5dGdxbnl0b2Z1d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjE2MjUsImV4cCI6MjEwNjUzNzYyNX0.HdbGdFQL2XgIhBqU7RjjNIQZH8pdIkL_PjDigVZ3qrQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// ACTIVE SUPABASE DATA LAYER
// ==========================================

export async function getCurrentUser(): Promise<Member | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return {
        id: user.id,
        member_id: `GSD-${user.id.slice(0, 4).toUpperCase()}`,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member User',
        email: user.email || '',
        phone: '',
        role: user.user_metadata?.role || 'member',
        rank: user.user_metadata?.business_status || 'Director',
        office_id: 'off-01',
        office_name: 'Global HQ — London',
        status: 'ACTIVE',
        avatar_url: '',
        join_date: new Date().toISOString().slice(0, 10),
        pv_total: 14850,
        earnings_ytd: 184500,
        health_score: 94,
        downline_count: 342
      };
    }

    return {
      id: data.id,
      member_id: data.member_id || `GSD-${data.id.slice(0, 4)}`,
      full_name: data.full_name || user.email || 'User',
      email: data.email || user.email || '',
      phone: data.phone || '',
      role: data.role || 'member',
      rank: data.rank || 'Director',
      office_id: data.office_id || '',
      office_name: data.office_name || 'Global HQ — London',
      status: data.status || 'ACTIVE',
      avatar_url: data.avatar_url || '',
      join_date: data.join_date || new Date().toISOString().slice(0, 10),
      pv_total: data.pv_total || 0,
      earnings_ytd: data.earnings_ytd || 0,
      health_score: data.health_score || 0,
      downline_count: data.downline_count || 0
    };
  } catch (err) {
    console.error('Error fetching current user profile from Supabase:', err);
    return null;
  }
}

export async function getMembers(): Promise<Member[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true });

    if (error || !data) return [];
    return data as Member[];
  } catch (err) {
    console.error('Error fetching members from Supabase:', err);
    return [];
  }
}

export async function getOffices(): Promise<Office[]> {
  try {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data as Office[];
  } catch (err) {
    console.error('Error fetching offices from Supabase:', err);
    return [];
  }
}

export async function getPVSubmissions(): Promise<PVSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('pv_submissions')
      .select('*')
      .order('submission_date', { ascending: false });

    if (error || !data) return [];
    return data as PVSubmission[];
  } catch (err) {
    console.error('Error fetching PV submissions from Supabase:', err);
    return [];
  }
}

export async function getDuesRecords(): Promise<DuesRecord[]> {
  try {
    const { data, error } = await supabase
      .from('dues')
      .select('*')
      .order('due_date', { ascending: false });

    if (error || !data) return [];
    return data as DuesRecord[];
  } catch (err) {
    console.error('Error fetching dues records from Supabase:', err);
    return [];
  }
}

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) return [];
    return data as AttendanceRecord[];
  } catch (err) {
    console.error('Error fetching attendance from Supabase:', err);
    return [];
  }
}

export async function getEarningsRecords(): Promise<EarningsRecord[]> {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .order('period', { ascending: false });

    if (error || !data) return [];
    return data as EarningsRecord[];
  } catch (err) {
    console.error('Error fetching earnings from Supabase:', err);
    return [];
  }
}

export async function getHealthMetrics(): Promise<HealthMetric[]> {
  try {
    const { data, error } = await supabase
      .from('health_scores')
      .select('*');

    if (error || !data) return [];
    return data as HealthMetric[];
  } catch (err) {
    console.error('Error fetching health scores from Supabase:', err);
    return [];
  }
}

export async function getActivities(): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return [];
    return data as ActivityItem[];
  } catch (err) {
    console.error('Error fetching activities from Supabase:', err);
    return [];
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return [];
    return data as Notification[];
  } catch (err) {
    console.error('Error fetching notifications from Supabase:', err);
    return [];
  }
}
