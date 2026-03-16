import { useRef } from 'react';
import { Card as CardType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Download, Wallet, QrCode } from 'lucide-react';
import { getTheme } from '@/components/ThemePicker';
import QRCode from 'qrcode';

interface WalletCardProps {
  card: CardType;
  appUrl: string;
}

export function WalletCard({ card, appUrl }: WalletCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const publicUrl = `${appUrl}/${card.slug}`;
  const theme = getTheme(card.theme_color || 'dark');

  const downloadAsImage = async () => {
    // Dynamic import html2canvas
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
          aspectRatio: '1.586 / 1', // Standard credit card ratio
        }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: theme.accent }} />

        <div className="p-5 h-full flex flex-col justify-between">
          {/* Top row: logo + QR */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {card.company_logo_url ? (
                <img src={card.company_logo_url} alt="" className="h-8 w-auto object-contain rounded" />
              ) : card.company ? (
                <div className="text-xs font-bold opacity-70 uppercase tracking-wider">{card.company}</div>
              ) : null}
            </div>
            <div className="bg-white rounded-md p-1">
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    QRCode.toCanvas(canvas, publicUrl, {
                      width: 56,
                      margin: 0,
                      color: { dark: '#000000', light: '#FFFFFF' },
                    });
                  }
                }}
                className="rounded-sm"
              />
            </div>
          </div>

          {/* Middle: Name + Title */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              {card.full_name}
            </h3>
            {card.job_title && (
              <p className="text-sm opacity-80 mt-0.5" style={{ color: theme.accent }}>
                {card.job_title}
              </p>
            )}
          </div>

          {/* Bottom row: contact details */}
          <div className="flex items-end justify-between">
            <div className="space-y-0.5 text-xs opacity-75">
              {card.phone && <p>{card.phone}</p>}
              {card.email && <p>{card.email}</p>}
              {card.website && <p>{card.website.replace('https://', '')}</p>}
            </div>
            <div className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" style={{ color: theme.accent }} />
              <span className="text-[10px] font-semibold opacity-60">VCARD·OS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center gap-2">
        <Button variant="gold" size="sm" onClick={downloadAsImage}>
          <Download className="mr-1 h-4 w-4" /> Save Wallet Card
        </Button>
      </div>
    </div>
  );
}
