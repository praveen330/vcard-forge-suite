import { useState, useEffect, useCallback } from 'react';
import { Card, CardLink } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Eye, EyeOff, Upload } from 'lucide-react';
import { CardView } from '@/components/CardView';
import { AvatarUpload } from '@/components/AvatarUpload';
import { LinksManager } from '@/components/LinksManager';
import { GalleryManager } from '@/components/GalleryManager';
import { ThemePicker } from '@/components/ThemePicker';

const RESERVED_SLUGS = ['api', 'auth', 'dashboard', 'admin', 'www', 'app', '404', 'about', 'contact', 'privacy', 'terms'];

interface CardEditorProps {
  userId: string;
  card: Card | null;
  onSave: (card: Card) => void;
  organizationId?: string | null;
}

function validateWhatsApp(val: string): boolean {
  if (!val) return true;
  return /^\+\d{10,15}$/.test(val.replace(/\s/g, ''));
}

export function CardEditor({ userId, card, onSave, organizationId }: CardEditorProps) {
  const [form, setForm] = useState({
    full_name: '', job_title: '', company: '', bio: '', email: '',
    phone: '', whatsapp: '', website: '', linkedin: '', instagram: '',
    twitter: '', slug: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(card?.avatar_url || null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(card?.company_logo_url || null);
  const [themeColor, setThemeColor] = useState(card?.theme_color || 'dark');
  const [primaryColor, setPrimaryColor] = useState<string | null>(card?.primary_color || null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(card?.secondary_color || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(card?.gallery_images || []);
  const [cardLinks, setCardLinks] = useState<CardLink[]>([]);
  const [saving, setSaving] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (card) {
      setForm({
        full_name: card.full_name || '', job_title: card.job_title || '',
        company: card.company || '', bio: card.bio || '', email: card.email || '',
        phone: card.phone || '', whatsapp: card.whatsapp || '', website: card.website || '',
        linkedin: card.linkedin || '', instagram: card.instagram || '',
        twitter: card.twitter || '', slug: card.slug || '',
      });
      setAvatarUrl(card.avatar_url || null);
      setCompanyLogoUrl(card.company_logo_url || null);
      setThemeColor(card.theme_color || 'dark');
      setGalleryImages(card.gallery_images || []);
      loadLinks(card.id);
    }
  }, [card]);

  const loadLinks = async (cardId: string) => {
    const { data } = await supabase
      .from('card_links')
      .select('*')
      .eq('card_id', cardId)
      .order('sort_order');
    setCardLinks((data as unknown as CardLink[]) || []);
  };

  const validateSlug = (slug: string) => /^[a-z0-9-]{3,30}$/.test(slug) && !RESERVED_SLUGS.includes(slug);

  const checkSlug = useCallback(async (slug: string) => {
    if (!validateSlug(slug)) { setSlugAvailable(false); return; }
    setCheckingSlug(true);
    let query = supabase.from('cards').select('id').eq('slug', slug).neq('user_id', userId).limit(1);
    if (card?.id) query = query.neq('id', card.id);
    const { data } = await query;
    setSlugAvailable(!data || data.length === 0);
    setCheckingSlug(false);
  }, [userId, card?.id]);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const cardId = card?.id || crypto.randomUUID();
      const ext = file.name.split('.').pop() || 'png';
      const path = `${userId}/logo-${cardId}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = urlData.publicUrl + '?t=' + Date.now();
      setCompanyLogoUrl(url);
      toast.success('Logo uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    if (!form.slug.trim() || !validateSlug(form.slug)) { toast.error('Please enter a valid slug (3-30 chars, lowercase, numbers, hyphens)'); return; }
    if (slugAvailable === false) { toast.error('This slug is already taken or invalid'); return; }
    if (form.phone && !form.phone.startsWith('+')) { toast.error('Phone must include country code (e.g., +1...)'); return; }
    if (form.whatsapp && !validateWhatsApp(form.whatsapp)) { toast.error('WhatsApp format: +91XXXXXXXXXX'); return; }
    if (form.website && !form.website.startsWith('https://')) { toast.error('Website must start with https://'); return; }

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
        avatar_url: avatarUrl,
        company_logo_url: companyLogoUrl,
        theme_color: themeColor,
        gallery_images: galleryImages,
        organization_id: organizationId || card?.organization_id || null,
        active: true,
      };

      let result;
      if (card?.id) {
        const { data, error } = await supabase.from('cards').update(payload).eq('id', card.id).eq('user_id', userId).select().single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('cards').insert(payload).select().single();
        if (error) throw error;
        result = data;
      }
      toast.success('Card saved!');
      onSave(result as Card);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const waValid = validateWhatsApp(form.whatsapp);

  const previewCard: Card = {
    id: card?.id || '', user_id: userId, slug: form.slug,
    full_name: form.full_name || 'Your Name',
    job_title: form.job_title || null, company: form.company || null,
    bio: form.bio || null, email: form.email || null,
    phone: form.phone || null, whatsapp: form.whatsapp || null,
    website: form.website || null, linkedin: form.linkedin || null,
    instagram: form.instagram || null, twitter: form.twitter || null,
    avatar_url: avatarUrl, company_logo_url: companyLogoUrl,
    theme_color: themeColor, gallery_images: galleryImages,
    active: true, created_at: '', organization_id: null, role: 'employee',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">Edit Card</h2>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <><EyeOff className="mr-1 h-4 w-4" /> Hide Preview</> : <><Eye className="mr-1 h-4 w-4" /> Preview</>}
          </Button>
        </div>

        {showPreview && (
          <div className="lg:hidden rounded-xl border border-border overflow-hidden max-h-[60vh] overflow-y-auto">
            <CardView card={previewCard} links={cardLinks} appUrl={appUrl} />
          </div>
        )}

        <div className="grid gap-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <AvatarUpload
              currentUrl={avatarUrl}
              userId={userId}
              userName={form.full_name}
              onUpload={setAvatarUrl}
              onRemove={() => setAvatarUrl(null)}
            />
          </div>

          {/* Company Logo */}
          <div>
            <Label className="text-sm font-semibold">Company Logo</Label>
            <div className="flex items-center gap-3 mt-1">
              {companyLogoUrl ? (
                <div className="relative group">
                  <img src={companyLogoUrl} alt="Logo" className="h-12 w-auto rounded-lg border border-border object-contain bg-card p-1" />
                  <button
                    onClick={() => setCompanyLogoUrl(null)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

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
            <Input value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="+91 98765 43210" className="bg-card" />
            {form.whatsapp && (
              <p className={`text-xs mt-1 ${waValid ? 'text-green-500' : 'text-destructive'}`}>
                {waValid ? '✓ Valid' : '✗ Format: +91XXXXXXXXXX'}
              </p>
            )}
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

          {/* Divider */}
          <hr className="border-border" />

          {/* Theme Picker */}
          <ThemePicker value={themeColor} onChange={setThemeColor} />

          {/* Links Manager — only if card is saved */}
          {card?.id && (
            <>
              <hr className="border-border" />
              <LinksManager cardId={card.id} links={cardLinks} onUpdate={setCardLinks} />
            </>
          )}

          {/* Gallery — only if card is saved */}
          {card?.id && (
            <>
              <hr className="border-border" />
              <GalleryManager
                images={galleryImages}
                userId={userId}
                cardId={card.id}
                onChange={setGalleryImages}
              />
            </>
          )}

          {!card?.id && (
            <p className="text-xs text-muted-foreground italic">Save your card first to add links and gallery images.</p>
          )}
        </div>

        <Button variant="gold" size="full" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Card</>}
        </Button>
      </div>

      <div className="hidden lg:block w-[380px] sticky top-4">
        <div className="rounded-xl border border-border overflow-hidden max-h-[85vh] overflow-y-auto">
          <CardView card={previewCard} links={cardLinks} appUrl={appUrl} />
        </div>
      </div>
    </div>
  );
}
