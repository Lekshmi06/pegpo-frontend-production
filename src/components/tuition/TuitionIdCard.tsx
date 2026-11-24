import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  QrCode,
  Copy,
  Check,
  User as UserIcon,
  X,
} from 'lucide-react';
import { authService } from '../../services/authService';

export interface TuitionIdCardData {
  name: string;
  idNumber: string;
  role: string;
  email?: string;
  avatarUrl?: string;
  studentCode?: string;
  teacherCode?: string;
}

export interface TuitionIdCardProps {
  user?: Partial<TuitionIdCardData> | any | null;
  onDownload?: () => void;
  showDownloadBtn?: boolean;
  className?: string;
}

/**
 * Creates a clean, self-contained SVG portrait avatar for CORS-safe Canvas export
 */
export const getDummyAvatarSvg = (isTeacher: boolean, initials: string) => {
  const bgGradStart = isTeacher ? '#4f46e5' : '#f59e0b';
  const bgGradEnd = isTeacher ? '#3b82f6' : '#d97706';
  const cleanInitials = (initials || (isTeacher ? 'TC' : 'ST')).slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#avatarGrad)"/>
    <circle cx="60" cy="46" r="22" fill="#ffffff" opacity="0.95"/>
    <path d="M 24 110 C 26 84, 44 76, 60 76 C 76 76, 94 84, 96 110 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="90" cy="90" r="18" fill="#0f172a" stroke="#ffffff" stroke-width="2.5"/>
    <text x="90" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#f8fafc" text-anchor="middle">${cleanInitials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Renders the high-DPI (2x scale) EduPye Tuition ID Card onto an offscreen canvas and downloads as PNG
 */
export async function downloadIdCardPng(cardData: TuitionIdCardData, qrDataUrl: string): Promise<void> {
  const isTeacher = cardData.role === 'teacher';
  const scale = 2; // High-DPI retina scale
  const width = 340 * scale; // 680
  const height = 500 * scale; // 1000

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Enable crisp anti-aliasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Helper for rounded rectangles
  const drawRoundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill?: string,
    stroke?: string,
    lineWidth = 1
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  // 1. Crisp White Card Background
  drawRoundRect(0, 0, width, height, 36, '#ffffff', '#e2e8f0', 3);

  // 2. Lanyard Slot at top center
  drawRoundRect(width / 2 - 45, 18, 90, 10, 5, '#e2e8f0');

  // 3. Top Header Strip
  // EduPye Brand + Cap
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EDUPYE', 36, 68);

  ctx.fillStyle = '#64748b';
  ctx.font = '700 10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('TUITION NETWORK', 36, 84);

  // Role Pill Badge (Top Right)
  const roleText = isTeacher ? 'TUITION EDUCATOR' : 'TUITION STUDENT';
  const rolePillWidth = 190;
  const rolePillX = width - rolePillWidth - 36;
  const pillBg = isTeacher ? '#e0e7ff' : '#fef3c7';
  const pillBorder = isTeacher ? '#c7d2fe' : '#fde68a';
  const pillTextCol = isTeacher ? '#3730a3' : '#92400e';
  drawRoundRect(rolePillX, 48, rolePillWidth, 34, 17, pillBg, pillBorder, 1.5);

  ctx.fillStyle = pillTextCol;
  ctx.font = '800 12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(roleText, rolePillX + rolePillWidth / 2, 70);

  // Divider Line
  ctx.beginPath();
  ctx.moveTo(36, 104);
  ctx.lineTo(width - 36, 104);
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Avatar Drawing
  const initials = cardData.name
    ? cardData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : isTeacher
    ? 'TC'
    : 'ST';
  const avatarSvgUrl = getDummyAvatarSvg(isTeacher, initials);

  await new Promise<void>((resolve) => {
    const avatarImg = new Image();
    avatarImg.onload = () => {
      const avatarSize = 130;
      const avatarX = width / 2 - avatarSize / 2;
      const avatarY = 120;

      // Circle clip for avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Border around avatar
      ctx.beginPath();
      ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = isTeacher ? '#4f46e5' : '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Verified green badge
      ctx.beginPath();
      ctx.arc(width / 2 + 45, avatarY + avatarSize - 15, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Check mark inside badge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 + 39, avatarY + avatarSize - 15);
      ctx.lineTo(width / 2 + 43, avatarY + avatarSize - 11);
      ctx.lineTo(width / 2 + 51, avatarY + avatarSize - 19);
      ctx.stroke();

      resolve();
    };
    avatarImg.src = avatarSvgUrl;
  });

  // 5. User Full Name
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cardData.name || 'EduPye Member', width / 2, 282);

  // 6. Role Subtitle
  ctx.fillStyle = isTeacher ? '#4f46e5' : '#d97706';
  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(
    isTeacher ? 'Verified Tuition Educator • Instructor' : 'Enrolled Tuition Student • Scholar',
    width / 2,
    306
  );

  // 7. Alphanumeric Tuition ID Badge Box
  const idBoxW = 280;
  const idBoxH = 44;
  const idBoxX = width / 2 - idBoxW / 2;
  const idBoxY = 325;
  drawRoundRect(idBoxX, idBoxY, idBoxW, idBoxH, 12, '#f8fafc', '#cbd5e1', 1.5);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 20px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(cardData.idNumber, width / 2, idBoxY + 29);

  // 8. QR Code Container & Drawing
  const qrBoxSize = 250;
  const qrBoxX = width / 2 - qrBoxSize / 2;
  const qrBoxY = 388;
  drawRoundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 28, 20, '#ffffff', '#e2e8f0', 2);

  await new Promise<void>((resolve) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrRenderSize = 220;
      const qrX = width / 2 - qrRenderSize / 2;
      const qrY = qrBoxY + 12;
      ctx.drawImage(qrImg, qrX, qrY, qrRenderSize, qrRenderSize);

      ctx.fillStyle = '#64748b';
      ctx.font = '800 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN TO VERIFY CREDENTIAL', width / 2, qrBoxY + qrBoxSize + 18);
      resolve();
    };
    qrImg.src = qrDataUrl;
  });

  // 9. Status & Security Info
  ctx.fillStyle = '#059669';
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('● OFFICIAL SECURITY ID • NON-TRANSFERABLE', width / 2, 700);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Issued by EduPye Centralized Academic Registry', width / 2, 720);

  // 10. Status Footer Banner (Dark Navy Strip)
  const footerH = 74;
  const footerY = height - footerH;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.lineTo(width, height - 36);
  ctx.quadraticCurveTo(width, height, width - 36, height);
  ctx.lineTo(36, height);
  ctx.quadraticCurveTo(0, height, 0, height - 36);
  ctx.closePath();
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.restore();

  // Footer Text
  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VERIFIED ACTIVE MEMBER • EDUPYE TUITION', width / 2, footerY + 34);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('SECURE 1:1 & GROUP COHORT WORKSPACE ACCESS', width / 2, footerY + 54);

  // Convert to Blob and Trigger Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduPye-ID-${cardData.idNumber || 'MEMBER'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, 'image/png');
}

export const TuitionIdCard: React.FC<TuitionIdCardProps> = ({
  user,
  onDownload,
  showDownloadBtn = true,
  className = '',
}) => {
  const currentUser = authService.getCurrentUser();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Resolve Card Data
  const idNumber =
    user?.idNumber ||
    (user as any)?.teacherCode ||
    (user as any)?.studentCode ||
    currentUser?.teacherCode ||
    currentUser?.studentCode ||
    'STU-VERIFIED';

  const isTeacher =
    user?.role === 'teacher' ||
    Boolean((user as any)?.teacherCode) ||
    Boolean(currentUser?.teacherCode) ||
    idNumber.startsWith('TCH');

  const role: 'teacher' | 'student' = isTeacher ? 'teacher' : 'student';
  const name = user?.name || currentUser?.name || (isTeacher ? 'Tuition Educator' : 'Tuition Student');
  const email = user?.email || currentUser?.email || '';

  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dummyAvatar = getDummyAvatarSvg(isTeacher, initials);

  // Generate QR Code data URL
  useEffect(() => {
    const payload = JSON.stringify({
      platform: 'EduPye Tuition',
      role: isTeacher ? 'Tuition Educator' : 'Tuition Student',
      name,
      idNumber,
      verified: true,
      issuedAt: new Date().getFullYear(),
    });

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate Tuition ID QR code:', err));
  }, [idNumber, isTeacher, name]);

  const handleDownload = async () => {
    if (!qrDataUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadIdCardPng({ name, idNumber, role, email }, qrDataUrl);
      onDownload?.();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(idNumber);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 340px Vertical ID Card Badge */}
      <div
        id={`tuition-id-card-${idNumber}`}
        className="w-[340px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col text-slate-900 transition-all select-none relative"
        style={{ minHeight: '520px' }}
      >
        {/* Lanyard Slot Cutout */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-16 h-2 rounded-full bg-slate-200 shadow-inner" />
        </div>

        {/* Card Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs ${
                isTeacher
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-600'
                  : 'bg-gradient-to-br from-amber-500 to-amber-600'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs tracking-wider text-slate-900 block leading-tight">
                EDUPYE
              </span>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest block uppercase">
                TUITION NETWORK
              </span>
            </div>
          </div>

          {/* Role Accent Pill */}
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs ${
              isTeacher
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isTeacher ? 'Tuition Educator' : 'Tuition Student'}
          </span>
        </div>

        {/* Card Body */}
        <div className="px-5 py-4 flex flex-col items-center text-center space-y-3">
          {/* Avatar with Verified Ring & Badge */}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full p-1 border-2 shadow-md ${
                isTeacher ? 'border-indigo-500' : 'border-amber-500'
              }`}
            >
              <img
                src={dummyAvatar}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div
              className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="Verified Identity"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Name & Role Subtitle */}
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
              {name}
            </h3>
            <p
              className={`text-xs font-bold ${
                isTeacher ? 'text-indigo-600' : 'text-amber-600'
              }`}
            >
              {isTeacher ? 'Certified Tuition Educator' : 'Enrolled Tuition Student'}
            </p>
          </div>

          {/* Permanent Alphanumeric Code Badge */}
          <div className="w-full">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tuition ID:
              </span>
              <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                {idNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Copy Tuition ID"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Scannable QR Code */}
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200 shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Credential Verification QR Code"
                className="w-36 h-36 object-contain"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center bg-slate-50 text-slate-400">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>
            )}
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">
              SCAN TO VERIFY CREDENTIAL
            </span>
          </div>

          {/* Security Subtitle */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>OFFICIAL SECURITY ID &bull; NON-TRANSFERABLE</span>
            </p>
            <p className="text-[9px] text-slate-400">
              Valid for Scheduled 1:1 &amp; Centralized Live SmartBoard Rooms
            </p>
          </div>
        </div>

        {/* Status Footer Banner */}
        <div className="mt-auto bg-slate-900 text-white px-4 py-2.5 text-center">
          <p className="text-[11px] font-extrabold tracking-wider text-slate-100 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>VERIFIED ACTIVE MEMBER &bull; EDUPYE TUITION</span>
          </p>
          <p className="text-[9px] text-slate-400 font-medium">
            Academic Identity Credential
          </p>
        </div>
      </div>

      {/* One-Click Download Button */}
      {showDownloadBtn && (
        <button
          onClick={handleDownload}
          disabled={isDownloading || !qrDataUrl}
          className="w-[340px] py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Generating PNG Card...' : 'Download ID Card (PNG)'}</span>
        </button>
      )}
    </div>
  );
};
export default TuitionIdCard;
