import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface AvatarUploadProps {
  currentUrl: string | null;
  userId: string;
  userName?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
}

function compressImage(file: File, maxSize: number = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({ currentUrl, userId, userName, onUpload, onRemove }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (userName || '?').charAt(0).toUpperCase();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Please select a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      const compressed = await compressImage(file);
      setProgress(50);

      const path = `${userId}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;
      setProgress(80);

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl + '?t=' + Date.now();
      setProgress(100);
      onUpload(url);
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden bg-card flex items-center justify-center">
          {currentUrl ? (
            <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-display text-primary font-bold">{initials}</span>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Camera className="w-6 h-6 text-foreground" />}
        </div>
        {currentUrl && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {uploading && <Progress value={progress} className="w-24 h-1" />}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Change Photo'}
      </Button>
    </div>
  );
}
