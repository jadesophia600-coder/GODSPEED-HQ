import React, { useState, useRef } from 'react';
import { Member, AttendanceRecord, PVSubmission, EarningsRecord } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { 
  X, 
  Award, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  Camera,
  Edit2,
  Save,
  CheckCircle2,
  TrendingUp, 
  CheckSquare,
  FileText,
  User,
  ShieldCheck
} from 'lucide-react';

interface MemberProfileModalProps {
  member: Member | null;
  onClose: () => void;
  onSaveProfile?: (updates: Partial<Member>) => Promise<void>;
  attendanceRecords?: AttendanceRecord[];
  pvSubmissions?: PVSubmission[];
  earningsRecords?: EarningsRecord[];
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ 
  member, 
  onClose,
  onSaveProfile,
  attendanceRecords = [],
  pvSubmissions = [],
  earningsRecords = []
}) => {
  if (!member) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'pv' | 'earnings' | 'attendance'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Form State
  const [fullName, setFullName] = useState(member.full_name || '');
  const [email, setEmail] = useState(member.email || '');
  const [phone, setPhone] = useState(member.phone || '');
  const [rank, setRank] = useState<string>(member.rank || 'Distributors');
  const [officeName, setOfficeName] = useState(member.office_name || 'GODSPEED Office');
  const [avatarUrl, setAvatarUrl] = useState(member.avatar_url || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter records for this specific member
  const memberAttendance = attendanceRecords.filter(
    r => r.member_id === member.id || r.member_name === member.full_name
  );
  const memberPV = pvSubmissions.filter(
    p => p.member_id === member.id || p.member_name === member.full_name
  );
  const memberEarnings = earningsRecords.filter(
    e => e.member_id === member.id || e.member_name === member.full_name
  );

  // Calculate real PV total & Earnings total if available
  const realPvTotal = memberPV.reduce((sum, item) => item.status === 'APPROVED' ? sum + item.pv_amount : sum, member.pv_total || 0);
  const realEarningsTotal = memberEarnings.reduce((sum, item) => sum + item.total_amount, member.earnings_ytd || 0);
  const attendanceCount = memberAttendance.length;

  // Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        setImagePreview(result);
        setSuccessMsg('New profile photo selected. Click Save to update profile.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Profile & Email
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Email address cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<Member> = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        rank: rank,
        office_name: officeName.trim(),
        avatar_url: avatarUrl
      };

      if (onSaveProfile) {
        await onSaveProfile(updates);
      }

      setSuccessMsg('Profile & Email updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg(err?.message || 'Failed to save profile updates.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeAvatar = imagePreview || avatarUrl || member.avatar_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Hidden File Input for Device Upload */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Hero Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0B132B] text-white relative">
          
          {/* Notification Messages */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar with Camera Picker Trigger */}
            <div className="relative group">
              {activeAvatar ? (
                <img
                  src={activeAvatar}
                  alt={fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white/10 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white text-3xl font-extrabold ring-4 ring-white/10 shadow-xl">
                  {fullName ? fullName.slice(0, 2).toUpperCase() : 'GS'}
                </div>
              )}

              {/* Upload Photo Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-white"
                title="Upload Profile Picture from Device"
              >
                <Camera className="w-6 h-6 mb-1 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 transition-transform active:scale-95"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Summary */}
            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{fullName || member.full_name}</h2>
                <StatusBadge status={member.status} size="sm" />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 font-mono mb-3">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{member.member_id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold font-sans">
                  <Award className="w-3.5 h-3.5" />
                  {rank}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {officeName}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-white">{email || member.email}</span>
                </span>
                {phone && (
                  <span className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Joined {member.join_date}
                </span>
              </div>

              {/* Action Edit Toggle */}
              <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile & Email'}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/80 hover:bg-blue-600 text-white transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Profile Edit Form Section */}
        {isEditing && (
          <form onSubmit={handleSave} className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Update Member Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Rank / Status
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Distributors">Distributors</option>
                  <option value="PRO">PRO</option>
                  <option value="Manager">Manager</option>
                  <option value="Senior Manager">Senior Manager</option>
                  <option value="Executive Manager">Executive Manager</option>
                  <option value="Director">Director</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Profile & Sync Email'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Navigation Header */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-xs font-semibold bg-slate-50/50 dark:bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pv')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pv' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            PV Submissions ({memberPV.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'earnings' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Payouts & Earnings
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'attendance' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Attendance Logs ({attendanceCount})
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 space-y-4">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total PV</span>
                  <p className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1">
                    {realPvTotal.toLocaleString()} PV
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earnings YTD</span>
                  <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ${realEarningsTotal.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Check-Ins</span>
                  <p className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
                    {attendanceCount}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Downlines</span>
                  <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    {member.downline_count || 0} Members
                  </p>
                </div>
              </div>

              {/* Verified Account Status Card */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">Official GODSPEED HQ Member Account</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Authenticated profile synced with Supabase database.</p>
                  </div>
                </div>
                <StatusBadge status={member.status} size="sm" />
              </div>
            </div>
          )}

          {/* PV TAB */}
          {activeTab === 'pv' && (
            <div className="text-xs space-y-3">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Personal Volume credits recorded for {fullName}:</p>
              {memberPV.length > 0 ? (
                <div className="space-y-2">
                  {memberPV.map((pv) => (
                    <div key={pv.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{pv.product_category || 'PV Submission'}</span>
                        <p className="text-[11px] text-slate-400">{pv.submission_date} • Ref: {pv.receipt_ref || pv.id}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{pv.pv_amount} PV</span>
                        <div><StatusBadge status={pv.status} size="sm" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No PV Submissions Yet</p>
                  <p className="text-slate-500 text-[11px] mt-1">Submit product volume under PV Submissions to track credits.</p>
                </div>
              )}
            </div>
          )}

          {/* EARNINGS TAB */}
          {activeTab === 'earnings' && (
            <div className="text-xs space-y-3">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Commission payouts and override records:</p>
              {memberEarnings.length > 0 ? (
                <div className="space-y-2">
                  {memberEarnings.map((earn) => (
                    <div key={earn.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{earn.period} Payout</span>
                        <p className="text-[11px] text-slate-400">Base: ${earn.base_commission} | Volume: ${earn.volume_bonus}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 text-sm">${earn.total_amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Payout Records Found</p>
                  <p className="text-slate-500 text-[11px] mt-1">Commission statements will appear here once payouts are processed.</p>
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="text-xs space-y-3">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Recorded QR scanner check-ins for {fullName}:</p>
              {memberAttendance.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {memberAttendance.map((att) => (
                    <div key={att.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{att.office_name}</span>
                          <p className="text-[11px] text-slate-400">{att.date} at {att.check_in_time} • {att.event_type}</p>
                        </div>
                      </div>
                      <StatusBadge status={att.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No Attendance Records Yet</p>
                  <p className="text-slate-500 text-[11px] mt-1">Scan an office QR code to verify your daily attendance.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
