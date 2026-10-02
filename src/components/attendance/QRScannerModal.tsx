import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Member, AttendanceValidationResult, AttendanceRecord } from '../../types';
import { validateAndRecordAttendanceToken } from '../../lib/supabase';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  RotateCcw, 
  Key, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface QRScannerModalProps {
  currentMember: Member;
  onClose: () => void;
  onSuccess?: (record: AttendanceRecord) => void;
}

type ScanState = 
  | 'INITIAL'
  | 'SCANNING'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'ALREADY_RECORDED'
  | 'EXPIRED'
  | 'INVALID_QR'
  | 'WRONG_OFFICE'
  | 'CAMERA_ERROR';

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  currentMember,
  onClose,
  onSuccess
}) => {
  const [scanState, setScanState] = useState<ScanState>('INITIAL');
  const [validationResult, setValidationResult] = useState<AttendanceValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualToken, setManualToken] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isComponentMounted = useRef<boolean>(true);

  // Initialize camera scanner
  const startCameraScanner = async (cameraIdToUse?: string) => {
    setScanState('SCANNING');
    setErrorMessage('');

    try {
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (!isComponentMounted.current) return;

      if (!devices || devices.length === 0) {
        setScanState('CAMERA_ERROR');
        setErrorMessage('No camera devices detected on this device.');
        return;
      }

      const formattedCameras = devices.map(d => ({
        id: d.id,
        label: d.label || `Camera ${d.id.slice(0, 4)}`
      }));
      setCameras(formattedCameras);

      const chosenCameraId = cameraIdToUse || selectedCameraId || devices[devices.length - 1].id; // default back camera on mobile
      setSelectedCameraId(chosenCameraId);

      // Stop previous instance if any
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          // ignore
        }
      }

      const html5QrcodeScanner = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      scannerRef.current = html5QrcodeScanner;

      await html5QrcodeScanner.start(
        chosenCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          // Success callback on detection
          if (scannerRef.current) {
            try {
              await scannerRef.current.stop();
            } catch (e) {
              // ignore
            }
          }
          await handleValidateScannedCode(decodedText);
        },
        (_errorMessage) => {
          // Frame error (normal during scanning)
        }
      );
    } catch (err: any) {
      console.error('Camera Scanner Error:', err);
      if (isComponentMounted.current) {
        setScanState('CAMERA_ERROR');
        setErrorMessage(
          err?.message?.includes('Permission')
            ? 'Camera access was denied. Please allow camera permissions in your browser.'
            : 'Could not launch camera scanner. You can use manual token entry below.'
        );
      }
    }
  };

  // Process scanned text or manual token
  const handleValidateScannedCode = async (scannedText: string) => {
    setScanState('VERIFYING');
    try {
      const result = await validateAndRecordAttendanceToken(scannedText, currentMember);
      setValidationResult(result);

      if (result.success) {
        setScanState('SUCCESS');
        if (result.record && onSuccess) {
          onSuccess(result.record);
        }
      } else {
        if (result.code === 'ALREADY_RECORDED') {
          setScanState('ALREADY_RECORDED');
        } else if (result.code === 'EXPIRED') {
          setScanState('EXPIRED');
        } else if (result.code === 'WRONG_OFFICE') {
          setScanState('WRONG_OFFICE');
        } else {
          setScanState('INVALID_QR');
        }
      }
    } catch (err: any) {
      setScanState('INVALID_QR');
      setErrorMessage(err?.message || 'Error processing attendance token.');
    }
  };

  // Submit manual token fallback
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleValidateScannedCode(manualToken.trim());
  };

  // Stop scanner on unmount
  useEffect(() => {
    isComponentMounted.current = true;
    startCameraScanner();

    return () => {
      isComponentMounted.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
        });
      }
    };
  }, []);

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Scan Attendance QR Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Point your camera at the office attendance QR code.
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

        {/* Content Box */}
        <div className="p-6">

          {/* STATE 1: SCANNING / CAMERA STREAM */}
          {scanState === 'SCANNING' && (
            <div className="flex flex-col items-center space-y-4">
              
              <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 flex items-center justify-center">
                {/* HTML5 QR Container */}
                <div id="qr-reader" className="w-full h-full" />

                {/* Frame Overlay graphic */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-emerald-400 rounded-2xl relative shadow-2xl shadow-emerald-500/20">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    
                    {/* Laser scanning beam line animation */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-pulse my-28" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Position the QR code inside the frame
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Office: <span className="font-bold text-slate-800 dark:text-slate-200">{currentMember.office_name}</span>
                </p>
              </div>

              {/* Camera Selector dropdown if multiple available */}
              {cameras.length > 1 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => startCameraScanner(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              )}

              {/* Toggle manual token input fallback */}
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-2"
              >
                <Key className="w-3.5 h-3.5" />
                {showManualInput ? 'Hide Manual Token Input' : 'Having camera issues? Enter Token Manually'}
              </button>

              {showManualInput && (
                <form onSubmit={handleManualSubmit} className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Enter Session Token (e.g. GSD-ATT-LON-1092)"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 shadow-sm"
                  >
                    Verify Manual Token
                  </button>
                </form>
              )}

            </div>
          )}

          {/* STATE 2: VERIFYING */}
          {scanState === 'VERIFYING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center animate-spin">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Verifying Attendance Token...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Checking office permissions, session validity, and duplicate attendance records.
              </p>
            </div>
          )}

          {/* STATE 3: ATTENDANCE SUCCESS SCREEN */}
          {scanState === 'SUCCESS' && validationResult?.record && (
            <div className="py-4 flex flex-col items-center text-center space-y-5 animate-scale-up">
              
              {/* Huge animated check icon */}
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
                  Attendance Marked Successfully
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">
                  Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {currentMember.full_name.split(' ')[0]}!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your attendance has been recorded in the Supabase office ledger.
                </p>
              </div>

              {/* Verified Details Card */}
              <div className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-500" /> Member
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{validationResult.record.member_name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-500" /> Office Hub
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{validationResult.record.office_name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" /> Date
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{validationResult.record.date}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-500" /> Check-in Time
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{validationResult.record.check_in_time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Status
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    validationResult.record.status === 'LATE'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {validationResult.record.status}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>BACK TO DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STATE 4: ALREADY RECORDED ERROR */}
          {scanState === 'ALREADY_RECORDED' && (
            <div className="py-4 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Attendance Already Recorded
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  You have already marked your attendance for today.
                </p>
              </div>

              <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex justify-between">
                  <span className="font-medium text-amber-700 dark:text-amber-400">Recorded Time:</span>
                  <span className="font-bold font-mono">{validationResult?.existingTime || 'Earlier Today'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-amber-700 dark:text-amber-400">Office Hub:</span>
                  <span className="font-bold">{validationResult?.existingOffice || currentMember.office_name}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* STATE 5: EXPIRED / INVALID / WRONG OFFICE ERROR */}
          {(scanState === 'EXPIRED' || scanState === 'INVALID_QR' || scanState === 'WRONG_OFFICE' || scanState === 'CAMERA_ERROR') && (
            <div className="py-4 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {scanState === 'EXPIRED' ? 'QR Code Expired' : scanState === 'WRONG_OFFICE' ? 'Wrong Office QR' : 'Scan Failed'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {validationResult?.message || errorMessage || 'Verification check failed.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={() => startCameraScanner()}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Scanning Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500"
                >
                  Close
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
