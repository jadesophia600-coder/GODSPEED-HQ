import { createClient } from '@supabase/supabase-js';
import type { 
  Member, 
  Office, 
  PVSubmission, 
  DuesRecord, 
  AttendanceRecord, 
  AttendanceSession,
  AttendanceValidationResult,
  EarningsRecord, 
  HealthMetric, 
  ActivityItem,
  Notification,
  GenealogyNode
} from '../types';

// Active Supabase Credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://beetwyqytgqnytofuwoh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZXR3eXF5dGdxbnl0b2Z1d29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjE2MjUsImV4cCI6MjEwNjUzNzYyNX0.HdbGdFQL2XgIhBqU7RjjNIQZH8pdIkL_PjDigVZ3qrQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// ACTIVE SUPABASE DATA LAYER
// ==========================================

export function cleanMemberId(rawId?: string, seedStr?: string): string {
  if (rawId && !rawId.toLowerCase().includes('usr') && !rawId.endsWith('-') && rawId.startsWith('GSD-') && rawId.length >= 7) {
    return rawId;
  }
  let hash = 0;
  const seed = seedStr || rawId || 'godspeed';
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const num = 1000 + (Math.abs(hash) % 9000);
  return `GSD-${num}`;
}

export async function getCurrentUser(): Promise<Member | null> {
  try {
    const storedEmail = localStorage.getItem('godspeed_user_email') || '';
    const storedRank = localStorage.getItem('godspeed_user_rank') || '';
    const storedAvatar = localStorage.getItem('godspeed_user_avatar') || '';
    const { data: { user } } = await supabase.auth.getUser();

    const targetUserId = user?.id;
    const targetEmail = user?.email || storedEmail;

    if (!targetUserId && !targetEmail) return null;

    const registeredRank = storedRank || user?.user_metadata?.business_status || 'Distributors';

    // 1. Attempt lookup by user.id in profiles
    if (targetUserId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (!error && data) {
        const resolvedAvatar = data.avatar_url || storedAvatar;
        if (data.avatar_url) localStorage.setItem('godspeed_user_avatar', data.avatar_url);
        if (data.rank) localStorage.setItem('godspeed_user_rank', data.rank);

        return {
          id: data.id,
          member_id: cleanMemberId(data.member_id, data.email || data.id),
          full_name: data.full_name || targetEmail || 'User',
          email: data.email || targetEmail || '',
          phone: data.phone || '',
          role: data.role || 'member',
          rank: data.rank || registeredRank,
          office_id: data.office_id || 'off-01',
          office_name: data.office_name || 'GODSPEED Office',
          status: data.status || 'ACTIVE',
          avatar_url: resolvedAvatar,
          join_date: data.join_date || new Date().toISOString().slice(0, 10),
          pv_total: data.pv_total || 0,
          earnings_ytd: data.earnings_ytd || 0,
          health_score: data.health_score || 100,
          downline_count: data.downline_count || 0
        };
      }
    }

    // 2. Attempt lookup by email in profiles
    if (targetEmail) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', targetEmail)
        .single();

      if (profileByEmail) {
        const resolvedAvatar = profileByEmail.avatar_url || storedAvatar;
        if (profileByEmail.avatar_url) localStorage.setItem('godspeed_user_avatar', profileByEmail.avatar_url);
        if (profileByEmail.rank) localStorage.setItem('godspeed_user_rank', profileByEmail.rank);

        return {
          id: profileByEmail.id,
          member_id: cleanMemberId(profileByEmail.member_id, targetEmail),
          full_name: profileByEmail.full_name || targetEmail.split('@')[0],
          email: profileByEmail.email || targetEmail,
          phone: profileByEmail.phone || '',
          role: profileByEmail.role || 'member',
          rank: profileByEmail.rank || registeredRank,
          office_id: profileByEmail.office_id || 'off-01',
          office_name: profileByEmail.office_name || 'GODSPEED Office',
          status: profileByEmail.status || 'ACTIVE',
          avatar_url: resolvedAvatar,
          join_date: profileByEmail.join_date || new Date().toISOString().slice(0, 10),
          pv_total: profileByEmail.pv_total || 0,
          earnings_ytd: profileByEmail.earnings_ytd || 0,
          health_score: profileByEmail.health_score || 100,
          downline_count: profileByEmail.downline_count || 0
        };
      }

      // 3. Attempt lookup by email in members table
      const { data: memberByEmail } = await supabase
        .from('members')
        .select('*')
        .eq('email', targetEmail)
        .single();

      if (memberByEmail) {
        const resolvedAvatar = memberByEmail.avatar_url || storedAvatar;
        return {
          ...memberByEmail,
          member_id: cleanMemberId(memberByEmail.member_id, targetEmail),
          rank: memberByEmail.rank || registeredRank,
          avatar_url: resolvedAvatar
        } as Member;
      }
    }

    // Fallback constructed member object
    const resolvedId = targetUserId || `usr-${targetEmail.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)}`;
    const storedRole = (localStorage.getItem('godspeed_user_role') as any) || 'member';

    return {
      id: resolvedId,
      member_id: cleanMemberId('', targetEmail),
      full_name: user?.user_metadata?.full_name || localStorage.getItem('godspeed_user_name') || targetEmail.split('@')[0] || 'Member User',
      email: targetEmail,
      phone: '',
      role: user?.user_metadata?.role || storedRole,
      rank: registeredRank,
      office_id: 'off-01',
      office_name: 'GODSPEED Office',
      status: 'ACTIVE',
      avatar_url: storedAvatar,
      join_date: new Date().toISOString().slice(0, 10),
      pv_total: 0,
      earnings_ytd: 0,
      health_score: 100,
      downline_count: 0
    };
  } catch (err) {
    console.error('Error fetching current user profile from Supabase:', err);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Member>
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();

    // Store in localStorage for instant persistence
    if (updates.avatar_url) localStorage.setItem('godspeed_user_avatar', updates.avatar_url);
    if (updates.rank) localStorage.setItem('godspeed_user_rank', updates.rank);
    if (updates.email) localStorage.setItem('godspeed_user_email', updates.email);
    if (updates.full_name) localStorage.setItem('godspeed_user_name', updates.full_name);

    // 1. Update profiles table
    const profilePayload: any = { updated_at: nowIso };
    if (updates.full_name !== undefined) profilePayload.full_name = updates.full_name;
    if (updates.email !== undefined) profilePayload.email = updates.email;
    if (updates.phone !== undefined) profilePayload.phone = updates.phone;
    if (updates.avatar_url !== undefined) profilePayload.avatar_url = updates.avatar_url;
    if (updates.rank !== undefined) profilePayload.rank = updates.rank;
    if (updates.office_name !== undefined) profilePayload.office_name = updates.office_name;
    
    // Clean member_id if updating profile
    if (updates.email || userId) {
      profilePayload.member_id = cleanMemberId('', updates.email || userId);
    }

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profilePayload
      }, { onConflict: 'id' });

    if (profileErr) {
      console.warn('Notice updating profiles table:', profileErr.message);
    }

    // 2. Update members table by email or member_id
    const memberPayload: any = { updated_at: nowIso };
    if (updates.full_name !== undefined) memberPayload.full_name = updates.full_name;
    if (updates.email !== undefined) memberPayload.email = updates.email;
    if (updates.phone !== undefined) memberPayload.phone = updates.phone;
    if (updates.avatar_url !== undefined) memberPayload.avatar_url = updates.avatar_url;
    if (updates.rank !== undefined) memberPayload.rank = updates.rank;
    if (updates.office_name !== undefined) memberPayload.office_name = updates.office_name;
    if (updates.email || userId) {
      memberPayload.member_id = cleanMemberId('', updates.email || userId);
    }

    if (updates.email) {
      await supabase
        .from('members')
        .update(memberPayload)
        .eq('email', updates.email);
    }

    // 3. Update auth metadata if logged in
    if (updates.email || updates.full_name) {
      try {
        await supabase.auth.updateUser({
          email: updates.email,
          data: {
            full_name: updates.full_name,
            avatar_url: updates.avatar_url
          }
        });
      } catch (authErr) {
        console.warn('Notice updating auth user:', authErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating profile in Supabase:', err);
    return { success: false, error: err?.message || 'Failed to update profile' };
  }
}


export async function getMembers(): Promise<Member[]> {
  try {
    // 1. Fetch from members table
    const { data: membersData } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true });

    // 2. Fetch from profiles table
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*');

    // 3. Local storage registered members fallback
    const localRegStr = localStorage.getItem('godspeed_registered_members') || '[]';
    let localReg: Member[] = [];
    try {
      localReg = JSON.parse(localRegStr);
    } catch (e) {}

    const memberMap = new Map<string, Member>();

    // Add local registered members
    localReg.forEach(m => {
      const key = (m.email || m.id).toLowerCase();
      memberMap.set(key, {
        ...m,
        member_id: cleanMemberId(m.member_id, m.email || m.id),
        status: m.status || 'ACTIVE'
      });
    });

    // Add profiles data
    if (profilesData) {
      profilesData.forEach((p: any) => {
        const key = (p.email || p.id).toLowerCase();
        memberMap.set(key, {
          id: p.id,
          member_id: cleanMemberId(p.member_id, p.email || p.id),
          full_name: p.full_name || p.email?.split('@')[0] || 'App Member',
          email: p.email || '',
          phone: p.phone || '',
          role: p.role || 'member',
          rank: p.rank || 'Distributors',
          office_id: p.office_id || 'off-01',
          office_name: p.office_name || 'GODSPEED Office',
          status: p.status || 'ACTIVE',
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.full_name || p.email || 'Member')}`,
          join_date: p.join_date || new Date().toISOString().slice(0, 10),
          pv_total: p.pv_total || 0,
          earnings_ytd: p.earnings_ytd || 0,
          health_score: p.health_score || 100,
          downline_count: p.downline_count || 0,
          sponsor_id: p.sponsor_id
        });
      });
    }

    // Add members table data
    if (membersData) {
      membersData.forEach((m: any) => {
        const key = (m.email || m.id).toLowerCase();
        const existing = memberMap.get(key);
        memberMap.set(key, {
          id: m.id || existing?.id || `usr-${key}`,
          member_id: cleanMemberId(m.member_id, m.email || m.id),
          full_name: m.full_name || existing?.full_name || key.split('@')[0],
          email: m.email || existing?.email || '',
          phone: m.phone || existing?.phone || '',
          role: m.role || existing?.role || 'member',
          rank: m.rank || existing?.rank || 'Distributors',
          office_id: m.office_id || existing?.office_id || 'off-01',
          office_name: m.office_name || existing?.office_name || 'GODSPEED Office',
          status: m.status || existing?.status || 'ACTIVE',
          avatar_url: m.avatar_url || existing?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.full_name || key)}`,
          join_date: m.join_date || existing?.join_date || new Date().toISOString().slice(0, 10),
          pv_total: m.pv_total || existing?.pv_total || 0,
          earnings_ytd: m.earnings_ytd || existing?.earnings_ytd || 0,
          health_score: m.health_score || existing?.health_score || 100,
          downline_count: m.downline_count || existing?.downline_count || 0,
          sponsor_id: m.sponsor_id || existing?.sponsor_id
        });
      });
    }

    return Array.from(memberMap.values());
  } catch (err) {
    console.error('Error fetching members from Supabase:', err);
    return [];
  }
}

export async function addDownlineMember(sponsorEmail: string, downlineData: Partial<Member>): Promise<{ success: boolean; error?: string }> {
  try {
    const downlineEmail = downlineData.email || '';
    const downlineId = downlineData.id || `usr-${Date.now()}`;
    const cleanId = cleanMemberId(downlineData.member_id, downlineEmail);

    // Save to local storage downline map for sponsor
    const localKey = `godspeed_downlines_${sponsorEmail.toLowerCase()}`;
    const existingStr = localStorage.getItem(localKey) || '[]';
    let existingList: string[] = [];
    try { existingList = JSON.parse(existingStr); } catch (e) {}
    if (!existingList.includes(downlineEmail)) {
      existingList.push(downlineEmail);
      localStorage.setItem(localKey, JSON.stringify(existingList));
    }

    // Save to registered members local storage
    const regKey = 'godspeed_registered_members';
    const regStr = localStorage.getItem(regKey) || '[]';
    let regList: Member[] = [];
    try { regList = JSON.parse(regStr); } catch (e) {}
    const existsInReg = regList.find(m => m.email.toLowerCase() === downlineEmail.toLowerCase());
    if (!existsInReg) {
      const newMemberObj: Member = {
        id: downlineId,
        member_id: cleanId,
        full_name: downlineData.full_name || downlineEmail.split('@')[0],
        email: downlineEmail,
        phone: downlineData.phone || '',
        role: downlineData.role || 'member',
        rank: downlineData.rank || 'PRO',
        office_id: 'off-01',
        office_name: downlineData.office_name || 'GODSPEED Office',
        status: 'ACTIVE',
        avatar_url: downlineData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(downlineData.full_name || downlineEmail)}`,
        join_date: new Date().toISOString().slice(0, 10),
        sponsor_id: sponsorEmail,
        pv_total: 0,
        earnings_ytd: 0,
        health_score: 100,
        downline_count: 0
      };
      regList.push(newMemberObj);
      localStorage.setItem(regKey, JSON.stringify(regList));
    }

    // Upsert into Supabase profiles & members
    await supabase.from('profiles').upsert([{
      id: downlineId,
      email: downlineEmail,
      full_name: downlineData.full_name,
      rank: downlineData.rank || 'PRO',
      role: 'member',
      member_id: cleanId,
      office_name: downlineData.office_name || 'GODSPEED Office',
      status: 'ACTIVE',
      sponsor_id: sponsorEmail
    }], { onConflict: 'id' });

    await supabase.from('members').upsert([{
      member_id: cleanId,
      full_name: downlineData.full_name,
      email: downlineEmail,
      role: 'member',
      rank: downlineData.rank || 'PRO',
      office_name: downlineData.office_name || 'GODSPEED Office',
      status: 'ACTIVE',
      sponsor_id: sponsorEmail
    }], { onConflict: 'email' });

    return { success: true };
  } catch (err: any) {
    console.error('Error adding downline in Supabase:', err);
    return { success: false, error: err?.message || 'Failed to add downline' };
  }
}

export function buildGenealogyTree(rootUser: Member, allMembers: Member[], level: number = 1, visited: Set<string> = new Set()): GenealogyNode {
  const rootKey = (rootUser.email || rootUser.id).toLowerCase();
  visited.add(rootKey);

  // Retrieve saved local downline emails for this user
  const localKey = `godspeed_downlines_${rootKey}`;
  const localStr = localStorage.getItem(localKey) || '[]';
  let localDownlineEmails: string[] = [];
  try { localDownlineEmails = JSON.parse(localStr); } catch (e) {}

  const directDownlines = allMembers.filter(m => {
    const childKey = (m.email || m.id).toLowerCase();
    if (visited.has(childKey)) return false;
    
    const isSponsoring = m.sponsor_id?.toLowerCase() === rootKey || m.sponsor_id?.toLowerCase() === rootUser.id.toLowerCase();
    const isLocal = localDownlineEmails.some(e => e.toLowerCase() === childKey);
    return isSponsoring || isLocal;
  });

  const childrenNodes: GenealogyNode[] = directDownlines.map(child => buildGenealogyTree(child, allMembers, level + 1, new Set(visited)));

  return {
    id: rootUser.id,
    member_id: cleanMemberId(rootUser.member_id, rootUser.email || rootUser.id),
    name: rootUser.full_name,
    rank: rootUser.rank || 'Distributors',
    role: rootUser.role,
    office: rootUser.office_name || 'GODSPEED Office',
    pv: rootUser.pv_total || 0,
    avatar: rootUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rootUser.full_name)}`,
    status: rootUser.status || 'ACTIVE',
    level: level,
    children: childrenNodes
  };
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
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as AttendanceRecord[];
  } catch (err) {
    console.error('Error fetching attendance from Supabase:', err);
    return [];
  }
}

export async function getAttendanceSessions(): Promise<AttendanceSession[]> {
  try {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as AttendanceSession[];
  } catch (err) {
    console.error('Error fetching attendance sessions:', err);
    return [];
  }
}

export async function createAttendanceSession(
  officeId: string, 
  officeName: string, 
  durationMinutes: number = 120,
  createdBy: string = 'Admin'
): Promise<AttendanceSession | null> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    const dateStr = now.toISOString().slice(0, 10);
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `GSD-ATT-${officeId.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const newSession = {
      office_id: officeId,
      office_name: officeName,
      session_token: token,
      date: dateStr,
      expires_at: expiresAt,
      status: 'ACTIVE',
      created_by: createdBy
    };

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([newSession])
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase error creating attendance session:', error);
      return {
        id: `sess-${Date.now()}`,
        ...newSession,
        status: 'ACTIVE'
      } as AttendanceSession;
    }

    return data as AttendanceSession;
  } catch (err) {
    console.error('Error creating attendance session:', err);
    return null;
  }
}

export async function closeAttendanceSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('attendance_sessions')
      .update({ status: 'CLOSED' })
      .eq('id', sessionId);
    return !error;
  } catch (err) {
    console.error('Error closing session:', err);
    return false;
  }
}

export async function validateAndRecordAttendanceToken(
  rawInput: string,
  member: Member
): Promise<AttendanceValidationResult> {
  try {
    let token = rawInput.trim();
    let parsedOfficeId = '';

    // If input is JSON payload
    if (token.startsWith('{')) {
      try {
        const payload = JSON.parse(token);
        token = payload.token || payload.session_token || token;
        parsedOfficeId = payload.office_id || '';
      } catch (e) {
        // continue with raw string
      }
    }

    const todayDate = new Date().toISOString().slice(0, 10);

    // 1. Check if user already marked attendance for today
    const { data: existingRecords } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', member.id)
      .eq('date', todayDate);

    if (existingRecords && existingRecords.length > 0) {
      const rec = existingRecords[0];
      return {
        success: false,
        code: 'ALREADY_RECORDED',
        message: 'Attendance Already Recorded. You have already marked attendance for today.',
        existingTime: rec.check_in_time,
        existingOffice: rec.office_name
      };
    }

    // Also check by member_name & date fallback
    const { data: existingByName } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_name', member.full_name)
      .eq('date', todayDate);

    if (existingByName && existingByName.length > 0) {
      const rec = existingByName[0];
      return {
        success: false,
        code: 'ALREADY_RECORDED',
        message: 'Attendance Already Recorded. You have already marked attendance for today.',
        existingTime: rec.check_in_time,
        existingOffice: rec.office_name
      };
    }

    // 2. Fetch attendance session by token
    const { data: sessionData, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    // If token not found in DB, check fallback format validity for standalone tokens
    let session = sessionData as AttendanceSession | null;

    if (sessionError || !session) {
      // Check if it's a validly formatted GSD-ATT token
      if (!token.startsWith('GSD-ATT-')) {
        return {
          success: false,
          code: 'INVALID_TOKEN',
          message: 'Invalid QR Code. This QR code is not a valid GODSPEED HQ attendance token.'
        };
      }
    } else {
      // Check session status
      if (session.status !== 'ACTIVE') {
        return {
          success: false,
          code: 'EXPIRED',
          message: 'This attendance QR code session has been closed or expired.'
        };
      }

      // Check expiry time
      const expiresAtMs = new Date(session.expires_at).getTime();
      if (Date.now() > expiresAtMs) {
        return {
          success: false,
          code: 'EXPIRED',
          message: 'This attendance QR code has expired. Please scan the current attendance QR code.'
        };
      }

    }

    // 3. Determine check-in status (PRESENT vs LATE) & Target Office Location
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 15);
    const statusVal = isLate ? 'LATE' : 'PRESENT';
    const checkInTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetOfficeName = session?.office_name || member.office_name || 'GODSPEED Office';
    const targetOfficeId = session?.office_id || member.office_id || 'off-01';

    // 4. Create the attendance record
    const newRecord: Partial<AttendanceRecord> = {
      member_id: member.id,
      member_name: member.full_name,
      office_id: targetOfficeId,
      office_name: targetOfficeName,
      date: todayDate,
      check_in_time: checkInTimeStr,
      event_type: 'Daily QR Attendance',
      status: statusVal,
      session_token: token
    };

    const { data: inserted, error: insertError } = await supabase
      .from('attendance')
      .insert([newRecord])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting attendance record:', insertError);
    }

    const finalRecord: AttendanceRecord = (inserted as AttendanceRecord) || {
      id: `att-${Date.now()}`,
      member_id: member.id,
      member_name: member.full_name,
      office_id: targetOfficeId,
      office_name: targetOfficeName,
      date: todayDate,
      check_in_time: checkInTimeStr,
      event_type: 'Daily QR Attendance',
      status: statusVal,
      session_token: token
    };

    return {
      success: true,
      code: 'SUCCESS',
      message: 'Attendance Marked Successfully!',
      record: finalRecord,
      session: session || undefined
    };

  } catch (err: any) {
    console.error('Error validating QR attendance:', err);
    return {
      success: false,
      code: 'INVALID_TOKEN',
      message: err?.message || 'An error occurred during QR verification.'
    };
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

export async function sendBroadcastAnnouncement(
  userName: string,
  userRank: string,
  messageText: string
): Promise<ActivityItem | null> {
  try {
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newActivity = {
      type: 'profile_updated',
      title: `Official Team Broadcast by ${userName} (${userRank})`,
      description: messageText,
      timestamp: timestampStr,
      user_name: userName,
      status: 'ACTIVE'
    };

    const newNotification = {
      title: `Team Announcement from ${userName}`,
      message: messageText,
      timestamp: timestampStr,
      read: false,
      type: 'gold'
    };

    const { data, error } = await supabase
      .from('activities')
      .insert([newActivity])
      .select()
      .single();

    await supabase.from('notifications').insert([newNotification]);

    if (error || !data) {
      return {
        id: `act-${Date.now()}`,
        ...newActivity,
        status: 'ACTIVE'
      } as ActivityItem;
    }

    return data as ActivityItem;
  } catch (err) {
    console.error('Error sending broadcast announcement:', err);
    return null;
  }
}
