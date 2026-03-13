import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentUrl: string | null;
  userId: string;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentUrl, userId, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      onUpload(data.publicUrl + '?t=' + Date.now());
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden bg-card flex items-center justify-center">
          {currentUrl ? (
            <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Camera className="w-6 h-6 text-foreground" />}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Change Photo'}
      </Button>
    </div>
  );
}
