import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, X, Loader2, ImageIcon } from 'lucide-react';

interface GalleryManagerProps {
  images: string[];
  userId: string;
  cardId: string;
  onChange: (images: string[]) => void;
}

export function GalleryManager({ images, userId, cardId, onChange }: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only images are allowed');
      return;
    }
    if (images.length >= 8) {
      toast.error('Maximum 8 gallery images');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/gallery/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = urlData.publicUrl + '?t=' + Date.now();

      const updated = [...images, url];
      // Save to card
      const { error: dbErr } = await supabase
        .from('cards')
        .update({ gallery_images: updated })
        .eq('id', cardId);
      if (dbErr) throw dbErr;

      onChange(updated);
      toast.success('Image added to gallery!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    try {
      const { error } = await supabase
        .from('cards')
        .update({ gallery_images: updated })
        .eq('id', cardId);
      if (error) throw error;
      onChange(updated);
      toast.success('Image removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Image Gallery <span className="text-muted-foreground font-normal">({images.length}/8)</span></Label>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading || images.length >= 8}
      >
        {uploading ? (
          <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Uploading...</>
        ) : (
          <><ImageIcon className="mr-1 h-4 w-4" /> Add Image</>
        )}
      </Button>
    </div>
  );
}
