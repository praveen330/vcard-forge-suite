import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRDisplayProps {
  url: string;
  size?: number;
  showDownload?: boolean;
  label?: string;
}

export function QRDisplay({ url, size = 200, showDownload = true, label }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: '#F5F2EC', light: '#13131C' },
    }).then(() => setReady(true));
  }, [url, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'vcard-qr.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl bg-card p-4 border border-border">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      {showDownload && ready && (
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-1 h-3 w-3" />
          Download QR
        </Button>
      )}
    </div>
  );
}
