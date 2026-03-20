import { useRef } from 'react';
import { Card as CardType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, CreditCard } from 'lucide-react';
import { getTheme } from '@/components/ThemePicker';
import QRCode from 'qrcode';

interface WalletCardProps {
  card: CardType;
  appUrl: string;
}

export function WalletCard({ card, appUrl }: WalletCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const publicUrl = `${appUrl}/${card.slug}`;
  const theme = getTheme(card.theme_color || 'dark', card.primary_color, card.secondary_color);

  const downloadAsImage = async () => {
    const { default: html2canvas } = await import('html2canvas');
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `${card.slug}-wallet.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const addToAppleWallet = () => {
    // Generate a .pkpass-compatible download page
    // Since .pkpass requires server-side signing with Apple certificates,
    // we create a mobile-optimized save experience instead
    const isMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // On iOS, download the card image — user can add to Photos widget or Shortcuts
      downloadAsImage();
      // Also open the contact as vCard which iOS can save natively
      const vcf = generateMiniVCard(card, publicUrl);
      const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${card.slug}.vcf`;
      setTimeout(() => { a.click(); URL.revokeObjectURL(url); }, 500);
    } else {
      downloadAsImage();
    }
  };

  const addToGoogleWallet = () => {
    // Google Wallet passes require server-side JWT signing via Google Pay API
    // For now, provide the best alternative: download card image + vCard
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      downloadAsImage();
      const vcf = generateMiniVCard(card, publicUrl);
      const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${card.slug}.vcf`;
      setTimeout(() => { a.click(); URL.revokeObjectURL(url); }, 500);
    } else {
      downloadAsImage();
    }
  };

  return (
    <div className="space-y-4">
      {/* Wallet-style business card */}
      <div
        ref={cardRef}
        className="relative rounded-2xl overflow-hidden shadow-2xl mx-auto"
        style={{
          background: theme.gradient || theme.bg,
          color: theme.text,
          maxWidth: '400px',
          aspectRatio: '1.586 / 1',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: theme.accent }} />

        <div className="p-5 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {card.company_logo_url ? (
                <img src={card.company_logo_url} alt="" className="h-14 w-auto max-w-[140px] object-contain rounded" />
              ) : card.company ? (
                <div className="text-sm font-bold opacity-80 uppercase tracking-wider">{card.company}</div>
              ) : null}
            </div>
            <div className="bg-white rounded-md p-1">
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    QRCode.toCanvas(canvas, publicUrl, {
                      width: 60,
                      margin: 0,
                      color: { dark: '#000000', light: '#FFFFFF' },
                    });
                  }
                }}
                className="rounded-sm"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {card.full_name}
            </h3>
            {card.job_title && (
              <p className="text-sm opacity-80 mt-0.5" style={{ color: theme.accent }}>
                {card.job_title}
              </p>
            )}
            {card.company && (
              <p className="text-xs opacity-60 mt-0.5">{card.company}</p>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-0.5 text-xs opacity-75">
              {card.phone && <p>{card.phone}</p>}
              {card.email && <p>{card.email}</p>}
              {card.website && <p>{card.website.replace('https://', '')}</p>}
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" style={{ color: theme.accent }} />
              <span className="text-[10px] font-semibold opacity-60">VCARD·OS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save buttons */}
      <div className="flex flex-col gap-2">
        <Button variant="gold" size="sm" className="w-full" onClick={downloadAsImage}>
          <Download className="mr-1.5 h-4 w-4" /> Save Card Image
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={addToAppleWallet} className="text-xs">
            <Smartphone className="mr-1 h-3.5 w-3.5" /> Save to iPhone
          </Button>
          <Button variant="outline" size="sm" onClick={addToGoogleWallet} className="text-xs">
            <Smartphone className="mr-1 h-3.5 w-3.5" /> Save to Android
          </Button>
        </div>
        <p className="text-[10px] text-center opacity-40">
          Downloads card image + contact file for your phone
        </p>
      </div>
    </div>
  );
}

function generateMiniVCard(card: CardType, publicUrl: string): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${card.full_name}`];
  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.job_title) lines.push(`TITLE:${card.job_title}`);
  if (card.email) lines.push(`EMAIL;TYPE=WORK:${card.email}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
  if (card.website) lines.push(`URL:${card.website}`);
  lines.push(`NOTE:Digital card: ${publicUrl}`);
  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}
