import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { CardView } from '@/components/CardView';

const RESERVED_SLUGS = ['api', 'auth', 'dashboard', 'admin', 'www', 'app'];

interface CardEditorProps {
  userId: string;
  card: Card | null;
  onSave: (card: Card) => void;
}

export function CardEditor({ userId, card, onSave }: CardEditorProps) {
  const [form, setForm] = useState({
    full_name: '', job_title: '', company: '', bio: '', email: '',
    phone: '', whatsapp: '', website: '', linkedin: '', instagram: '',
    twitter: '', slug: '',
  });
  const [saving, setSaving] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (card) {
      setForm({
        full_name: card.full_name || '', job_title: card.job_title || '',
        company: card.company || '', bio: card.bio || '', email: card.email || '',
        phone: card.phone || '', whatsapp: card.whatsapp || '', website: card.website || '',
        linkedin: card.linkedin || '', instagram: card.instagram || '',
        twitter: card.twitter || '', slug: card.slug || '',
      });
    }
  }, [card]);

  const validateSlug = (slug: string) => /^[a-z0-9-]{3,30}$/.test(slug) && !RESERVED_SLUGS.includes(slug);

  const checkSlug = useCallback(async (slug: string) => {
    if (!validateSlug(slug)) { setSlugAvailable(false); return; }
    setCheckingSlug(true);
    const { data } = await supabase.from('cards').select('id').eq('slug', slug).neq('user_id', userId).limit(1);
    setSlugAvailable(!data || data.length === 0);
    setCheckingSlug(false);
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.slug) checkSlug(form.slug);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.slug, checkSlug]);

  const handleChange = (field: string, value: string) => {
    if (field === 'slug') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (field === 'bio') value = value.slice(0, 280);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    if (!form.slug.trim() || !validateSlug(form.slug)) { toast.error('Please enter a valid slug (3-30 chars, lowercase, numbers, hyphens)'); return; }
    if (slugAvailable === false) { toast.error('This slug is already taken or invalid'); return; }
    if (form.phone && !form.phone.startsWith('+')) { toast.error('Phone must include country code (e.g., +1...)'); return; }
    if (form.whatsapp && !form.whatsapp.startsWith('+')) { toast.error('WhatsApp must include country code'); return; }
    if (form.website && form.website && !form.website.startsWith('https://')) { toast.error('Website must start with https://'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: userId,
        full_name: form.full_name.trim(),
        job_title: form.job_title.trim() || null,
        company: form.company.trim() || null,
        bio: form.bio.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        website: form.website.trim() || null,
        linkedin: form.linkedin.trim() || null,
        instagram: form.instagram.trim() || null,
        twitter: form.twitter.trim() || null,
        active: true,
      };

      let result;
      if (card?.id) {
        const { data, error } = await supabase.from('cards').update(payload).eq('id', card.id).select().single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('cards').insert(payload).select().single();
        if (error) throw error;
        result = data;
      }
      toast.success('Card saved successfully!');
      onSave(result as Card);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const previewCard: Card = {
    id: card?.id || '', user_id: userId, slug: form.slug,
    full_name: form.full_name || 'Your Name',
    job_title: form.job_title || null, company: form.company || null,
    bio: form.bio || null, email: form.email || null,
    phone: form.phone || null, whatsapp: form.whatsapp || null,
    website: form.website || null, linkedin: form.linkedin || null,
    instagram: form.instagram || null, twitter: form.twitter || null,
    avatar_url: card?.avatar_url || null, active: true, created_at: '',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Form */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">Edit Card</h2>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <><EyeOff className="mr-1 h-4 w-4" /> Hide Preview</> : <><Eye className="mr-1 h-4 w-4" /> Preview</>}
          </Button>
        </div>

        {/* Show mobile preview */}
        {showPreview && (
          <div className="lg:hidden rounded-xl border border-border overflow-hidden max-h-[60vh] overflow-y-auto">
            <CardView card={previewCard} appUrl={appUrl} />
          </div>
        )}

        <div className="grid gap-4">
          <div>
            <Label>Username / Slug *</Label>
            <Input value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="john-doe" className="bg-card" />
            <div className="text-xs mt-1">
              {checkingSlug && <span className="text-muted-foreground">Checking...</span>}
              {!checkingSlug && form.slug && slugAvailable === true && <span className="text-green-500">✓ Available</span>}
              {!checkingSlug && form.slug && slugAvailable === false && <span className="text-destructive">✗ Unavailable or invalid</span>}
            </div>
          </div>

          <div>
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} placeholder="John Doe" className="bg-card" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input value={form.job_title} onChange={e => handleChange('job_title', e.target.value)} placeholder="CEO" className="bg-card" />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={e => handleChange('company', e.target.value)} placeholder="Acme Inc" className="bg-card" />
            </div>
          </div>

          <div>
            <Label>Bio <span className="text-muted-foreground">({form.bio.length}/280)</span></Label>
            <Textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="A short bio..." className="bg-card resize-none" rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="john@example.com" className="bg-card" />
            </div>
            <div>
              <Label>Phone (with country code)</Label>
              <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+1 555 123 4567" className="bg-card" />
            </div>
          </div>

          <div>
            <Label>WhatsApp (with country code)</Label>
            <Input value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="+1 555 123 4567" className="bg-card" />
          </div>

          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="https://example.com" className="bg-card" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={form.linkedin} onChange={e => handleChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/johndoe" className="bg-card" />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={e => handleChange('instagram', e.target.value)} placeholder="johndoe" className="bg-card" />
            </div>
          </div>

          <div>
            <Label>Twitter / X</Label>
            <Input value={form.twitter} onChange={e => handleChange('twitter', e.target.value)} placeholder="johndoe" className="bg-card" />
          </div>
        </div>

        <Button variant="gold" size="full" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Card</>}
        </Button>
      </div>

      {/* Desktop Preview */}
      <div className="hidden lg:block w-[380px] sticky top-4">
        <div className="rounded-xl border border-border overflow-hidden max-h-[85vh] overflow-y-auto">
          <CardView card={previewCard} appUrl={appUrl} />
        </div>
      </div>
    </div>
  );
}
