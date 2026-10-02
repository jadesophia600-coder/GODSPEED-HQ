import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Office, AttendanceSession } from '../../types';
import { createAttendanceSession, closeAttendanceSession } from '../../lib/supabase';
import { 
  QrCode, 
  X, 
  RefreshCw, 
  Power, 
  Download, 
  Clock, 
  Building2, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminQRGeneratorModalProps {
  offices: Office[];
  currentAdminName?: string;
  onClose: () => void;
  onSessionCreated?: (session: AttendanceSession) => void;
}

export const AdminQRGeneratorModal: React.FC<AdminQRGeneratorModalProps> = ({
  offices,
  currentAdminName = 'Administrator',
  onClose,
  onSessionCreated
}) => {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(offices[0]?.id || 'off-01');
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // default 2 hours
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  const selectedOffice = offices.find(o => o.id === selectedOfficeId) || {
    id: 'off-01',
    name: 'GODSPEED Office',
    code: 'LON-01'
  };

  // Generate QR Canvas Data URL
  const generateQRCodeCanvas = async (session: AttendanceSession) => {
    try {
      const payload = JSON.stringify({
        token: session.session_token,
        office_id: session.office_id,
        office_name: session.office_name,
        date: session.date,
        expires_at: session.expires_at,
        created_at: new Date().toISOString()
      });

      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error rendering QR code canvas:', err);
      setErrorMsg('Failed to render QR Code canvas.');
    }
  };

  // Handle Generate Session
  const handleGenerateSession = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const session = await createAttendanceSession(
        selectedOffice.id,
        selectedOffice.name,
        durationMinutes,
        currentAdminName
      );

      if (session) {
        setActiveSession(session);
        setIsExpired(false);
        await generateQRCodeCanvas(session);
        if (onSessionCreated) onSessionCreated(session);
      } else {
        setErrorMsg('Could not create attendance session.');
      }
    } catch (err) {
      setErrorMsg('Error initializing QR session.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Close Session
  const handleCloseActiveSession = async () => {
    if (!activeSession) return;
    await closeAttendanceSession(activeSession.id);
    setActiveSession(null);
    setQrDataUrl(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Live countdown timer
  useEffect(() => {
    if (!activeSession?.expires_at) return;

    const updateTimer = () => {
      const expiryMs = new Date(activeSession.expires_at).getTime();
      const diffMs = expiryMs - Date.now();

      if (diffMs <= 0) {
        setTimeLeftStr('EXPIRED');
        setIsExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        
        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);
        } else {
          setTimeLeftStr(`${mins}m ${secs}s`);
        }
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  // Initial auto-generation on load
  useEffect(() => {
    handleGenerateSession();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Generate Attendance QR Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a secure, time-bound attendance QR session for your office.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                Target Office Hub
              </label>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {offices.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Session Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={120}>2 Hours (Default)</option>
                <option value={240}>4 Hours</option>
                <option value={480}>8 Hours (Full Day)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* QR Code Display Card */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner relative">
            
            {activeSession && (
              <div className="w-full flex items-center justify-between mb-4 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {activeSession.office_name}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isExpired 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  }`}>
                    {isExpired ? 'QR EXPIRED' : 'QR ACTIVE'}
                  </span>
                  {!isExpired && (
                    <span className="font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {timeLeftStr}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* QR Image Frame */}
            {isGenerating ? (
              <div className="h-64 w-64 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs font-semibold">Generating Token...</span>
              </div>
            ) : qrDataUrl ? (
              <div className="relative group p-4 bg-white rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700">
                <img
                  src={qrDataUrl}
                  alt="Attendance QR Code"
                  className="w-64 h-64 object-contain rounded-lg"
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                  <a
                    href={qrDataUrl}
                    download={`GODSPEED_Attendance_QR_${selectedOffice.code}.png`}
                    className="p-3 bg-white text-slate-900 rounded-xl hover:bg-slate-100 shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-64 w-64 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">
                No Active QR Session
              </div>
            )}

            {/* Instruction banner */}
            <div className="mt-4 text-center max-w-sm">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Scan this QR code using the GODSPEED HQ app to mark attendance.
              </p>
              {activeSession && (
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                  Token: {activeSession.session_token}
                </p>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerateSession}
              disabled={isGenerating}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Refresh QR Token</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeSession && (
                <button
                  type="button"
                  onClick={handleCloseActiveSession}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 transition-colors flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Close Session</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
