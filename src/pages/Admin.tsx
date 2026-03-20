import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card as CardType, Scan, Promo, Organization, BulkImport } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Loader2, ArrowLeft, Trash2, Plus, BarChart3,
  Building2, CreditCard, Megaphone, Upload, Download, ExternalLink, Edit, X,
  ChevronDown, ChevronUp,
} from 'lucide-react';

const ADMIN_EMAIL = 'gpk330@gmail.com';
type AdminTab = 'dashboard' | 'management';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [cards, setCards] = useState<CardType[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [imports, setImports] = useState<BulkImport[]>([]);
  const [loading, setLoading] = useState(true);

  // Expandable sections
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showPromoSection, setShowPromoSection] = useState(false);
  const [showBulkSection, setShowBulkSection] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cardsRes, scansRes, promosRes, orgsRes, importsRes] = await Promise.all([
        supabase.from('cards').select('*').order('created_at', { ascending: false }),
        supabase.from('scans').select('*').order('created_at', { ascending: false }),
        supabase.from('promos').select('*').order('created_at', { ascending: false }),
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        supabase.from('bulk_imports').select('*').order('created_at', { ascending: false }),
      ]);
      setCards((cardsRes.data as CardType[]) || []);
      setScans((scansRes.data as Scan[]) || []);
      setPromos((promosRes.data as Promo[]) || []);
      setOrgs((orgsRes.data as Organization[]) || []);
      setImports((importsRes.data as BulkImport[]) || []);
    } catch (err: any) {
      toast.error('Failed to load admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from('cards').update({ active: !active }).eq('id', id);
      if (error) throw error;
      setCards(cards.map(c => c.id === id ? { ...c, active: !active } : c));
      toast.success(`Card ${!active ? 'activated' : 'deactivated'}`);
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Delete this card permanently?')) return;
    try {
      const { error } = await supabase.from('cards').delete().eq('id', id);
      if (error) throw error;
      setCards(cards.filter(c => c.id !== id));
      toast.success('Card deleted');
    } catch (err: any) { toast.error(err.message); }
  };

  const todayScans = scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
  const activeCards = cards.filter(c => c.active).length;

  // ─── ORG FORM ────────────────────────────────────────────────
  const [orgForm, setOrgForm] = useState({ name: '', owner_email: '', domain: '', max_cards: '10' });

  const saveOrg = async () => {
    if (!orgForm.name || !orgForm.owner_email) { toast.error('Name and owner email required'); return; }
    try {
      const slug = orgForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
      const { error } = await supabase.from('organizations').insert({
        name: orgForm.name.trim(),
        slug,
        owner_email: orgForm.owner_email.trim(),
        domain: orgForm.domain.trim() || null,
        max_cards: parseInt(orgForm.max_cards) || 10,
        active: true,
      });
      if (error) throw error;
      toast.success('Organization created — the owner can now log in as client admin');
      setOrgForm({ name: '', owner_email: '', domain: '', max_cards: '10' });
      setShowOrgForm(false);
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteOrg = async (id: string) => {
    if (!confirm('Delete this organization?')) return;
    try {
      const { error } = await supabase.from('organizations').delete().eq('id', id);
      if (error) throw error;
      setOrgs(orgs.filter(o => o.id !== id));
      toast.success('Organization deleted');
    } catch (err: any) { toast.error(err.message); }
  };

  // ─── ADD/EDIT CARD FORM ───────────────────────────────────────────
  const [cardForm, setCardForm] = useState({
    full_name: '', slug: '', job_title: '', company: '',
    email: '', phone: '', whatsapp: '', organization_id: '', bio: '',
    linkedin: '', instagram: '', twitter: '', website: '',
  });
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const startEditCard = (c: CardType) => {
    setEditingCard(c.id);
    setCardForm({
      full_name: c.full_name || '', slug: c.slug || '',
      job_title: c.job_title || '', company: c.company || '',
      email: c.email || '', phone: c.phone || '',
      whatsapp: c.whatsapp || '', organization_id: c.organization_id || '',
      bio: c.bio || '', linkedin: c.linkedin || '',
      instagram: c.instagram || '', twitter: c.twitter || '',
      website: c.website || '',
    });
    setShowCardForm(true);
    setTab('dashboard');
  };

  const cancelEditCard = () => {
    setEditingCard(null);
    setShowCardForm(false);
    setCardForm({ full_name: '', slug: '', job_title: '', company: '', email: '', phone: '', whatsapp: '', organization_id: '', bio: '', linkedin: '', instagram: '', twitter: '', website: '' });
  };

  const addCard = async () => {
    if (!cardForm.full_name || !cardForm.slug) { toast.error('Name and slug required'); return; }
    try {
      const payload: any = {
        full_name: cardForm.full_name.trim(),
        slug: cardForm.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        job_title: cardForm.job_title.trim() || null,
        company: cardForm.company.trim() || null,
        email: cardForm.email.trim() || null,
        phone: cardForm.phone.trim() || null,
        whatsapp: cardForm.whatsapp.trim() || null,
        bio: cardForm.bio.trim() || null,
        linkedin: cardForm.linkedin.trim() || null,
        instagram: cardForm.instagram.trim() || null,
        twitter: cardForm.twitter.trim() || null,
        website: cardForm.website.trim() || null,
        organization_id: cardForm.organization_id || null,
        active: true,
      };

      if (editingCard) {
        const { error } = await supabase.from('cards').update(payload).eq('id', editingCard);
        if (error) throw error;
        toast.success('Card updated!');
      } else {
        payload.user_id = user!.id;
        const { error } = await supabase.from('cards').insert(payload);
        if (error) throw error;
        toast.success('Card created — employee can claim it by logging in with their email');
      }
      cancelEditCard();
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  // ─── PROMO FORM ──────────────────────────────────────────────
  const emptyPromo = { card_id: '', title: '', description: '', cta_text: '', cta_url: '', image_url: '', active: true, expires_at: '' };
  const [promoForm, setPromoForm] = useState({ ...emptyPromo });
  const [editingPromo, setEditingPromo] = useState<string | null>(null);

  const savePromo = async () => {
    if (!promoForm.card_id || !promoForm.title) { toast.error('Card and title required'); return; }
    try {
      const payload = {
        card_id: promoForm.card_id,
        title: promoForm.title,
        active: promoForm.active,
        description: promoForm.description || null,
        cta_text: promoForm.cta_text || null,
        cta_url: promoForm.cta_url || null,
        image_url: promoForm.image_url || null,
        expires_at: promoForm.expires_at || null,
      };
      const { error } = editingPromo
        ? await supabase.from('promos').update(payload).eq('id', editingPromo)
        : await supabase.from('promos').insert(payload);
      if (error) throw error;
      toast.success('Promo saved');
      setEditingPromo(null);
      setPromoForm({ ...emptyPromo });
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  const deletePromo = async (id: string) => {
    try {
      const { error } = await supabase.from('promos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Promo deleted');
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  // ─── BULK IMPORT ─────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [bulkOrg, setBulkOrg] = useState('');
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const downloadTemplate = () => {
    const csv = 'full_name,job_title,company,email,phone,whatsapp,linkedin,instagram,twitter,slug\nJohn Smith,Sales Manager,Acme Corp,john@acme.com,+971501234567,+971501234567,https://linkedin.com/in/john,johnsmith,johnsmith,johnsmith\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'vcard-import-template.csv';
    a.click();
    toast.success('Template downloaded');
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) { toast.error('CSV must have a header row and at least one data row'); return; }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ''; });
      return row;
    });
    setCsvRows(rows);
    setCsvErrors({});

    setCheckingSlug(true);
    const slugs = rows.map(r => r.slug).filter(s => s && /^[a-z0-9-]{3,30}$/.test(s));
    const { data: existingSlugs } = await supabase.from('cards').select('slug').in('slug', slugs);
    const taken = new Set((existingSlugs || []).map((s: any) => s.slug));
    setCheckingSlug(false);

    const errors: Record<number, string> = {};
    rows.forEach((r, i) => {
      if (!r.full_name) errors[i] = 'full_name missing';
      else if (!r.slug) errors[i] = 'slug missing';
      else if (!/^[a-z0-9-]{3,30}$/.test(r.slug)) errors[i] = 'slug invalid';
      else if (taken.has(r.slug)) errors[i] = 'slug already taken';
    });
    setCsvErrors(errors);
    toast.success(`Parsed ${rows.length} rows — ${rows.length - Object.keys(errors).length} valid`);
  };

  const runImport = async () => {
    if (!bulkOrg) { toast.error('Select an organization first'); return; }
    const valid = csvRows.filter((_, i) => !csvErrors[i]);
    if (valid.length === 0) { toast.error('No valid rows'); return; }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;
    const errorDetails: any[] = [];

    for (const row of valid) {
      const { error } = await supabase.from('cards').insert({
        user_id: user!.id,
        organization_id: bulkOrg,
        full_name: row.full_name,
        slug: row.slug,
        job_title: row.job_title || null,
        company: row.company || null,
        email: row.email || null,
        phone: row.phone || null,
        whatsapp: row.whatsapp || null,
        linkedin: row.linkedin || null,
        instagram: row.instagram || null,
        twitter: row.twitter || null,
        active: true,
      });
      if (error) { errorCount++; errorDetails.push({ slug: row.slug, error: error.message }); }
      else { successCount++; }
    }

    await supabase.from('bulk_imports').insert({
      organization_id: bulkOrg,
      imported_by: user!.id,
      total_rows: csvRows.length,
      success_count: successCount,
      error_count: errorCount + Object.keys(csvErrors).length,
      errors: errorDetails,
    });

    toast.success(`✓ ${successCount} created  ✗ ${errorCount} failed`);
    setCsvRows([]);
    setCsvErrors({});
    if (fileRef.current) fileRef.current.value = '';
    setImporting(false);
    loadData();
  };

  // ─── ORG FILTER ──────────────────────────────────────────────
  const [cardOrgFilter, setCardOrgFilter] = useState('');
  const filteredCards = cardOrgFilter ? cards.filter(c => c.organization_id === cardOrgFilter) : cards;

  // ─── RENDER ──────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-display font-bold shrink-0">
          <span className="gold-text">Admin</span>
        </h1>
        <div className="flex gap-1 ml-auto">
          {[
            { key: 'dashboard' as AdminTab, label: 'Dashboard', icon: BarChart3 },
            { key: 'management' as AdminTab, label: 'Management', icon: Building2 },
          ].map(t => (
            <Button
              key={t.key}
              variant={tab === t.key ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => setTab(t.key)}
              className="shrink-0"
            >
              <t.icon className="h-4 w-4 mr-1" />
              {t.label}
            </Button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 max-w-5xl mx-auto space-y-6">

        {/* ══════════════════ DASHBOARD TAB ══════════════════ */}
        {tab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Cards', value: cards.length },
                { label: 'Active Cards', value: activeCards },
                { label: 'Organizations', value: orgs.length },
                { label: 'Scans Today', value: todayScans },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Card Form (collapsible) */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {editingCard ? 'Edit Card' : 'Add New Card'}
                </h3>
                <div className="flex gap-2">
                  {editingCard && (
                    <Button variant="ghost" size="sm" onClick={cancelEditCard}>
                      <X className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                  )}
                  {!editingCard && (
                    <Button variant="ghost" size="sm" onClick={() => setShowCardForm(!showCardForm)}>
                      {showCardForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
              {(showCardForm || editingCard) && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={cardForm.full_name}
                        onChange={e => setCardForm(f => ({
                          ...f,
                          full_name: e.target.value,
                          slug: editingCard ? f.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
                        }))}
                        className="bg-card"
                      />
                    </div>
                    <div>
                      <Label>Slug *</Label>
                      <Input value={cardForm.slug} onChange={e => setCardForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="bg-card" />
                    </div>
                    <div><Label>Job Title</Label><Input value={cardForm.job_title} onChange={e => setCardForm(f => ({ ...f, job_title: e.target.value }))} className="bg-card" /></div>
                    <div><Label>Company</Label><Input value={cardForm.company} onChange={e => setCardForm(f => ({ ...f, company: e.target.value }))} className="bg-card" /></div>
                    <div><Label>Email</Label><Input type="email" value={cardForm.email} onChange={e => setCardForm(f => ({ ...f, email: e.target.value }))} className="bg-card" /></div>
                    <div><Label>Phone</Label><Input value={cardForm.phone} onChange={e => setCardForm(f => ({ ...f, phone: e.target.value }))} className="bg-card" /></div>
                    <div><Label>WhatsApp</Label><Input value={cardForm.whatsapp} onChange={e => setCardForm(f => ({ ...f, whatsapp: e.target.value }))} className="bg-card" /></div>
                    <div><Label>Website</Label><Input value={cardForm.website} onChange={e => setCardForm(f => ({ ...f, website: e.target.value }))} className="bg-card" /></div>
                    <div><Label>LinkedIn</Label><Input value={cardForm.linkedin} onChange={e => setCardForm(f => ({ ...f, linkedin: e.target.value }))} className="bg-card" /></div>
                    <div><Label>Instagram</Label><Input value={cardForm.instagram} onChange={e => setCardForm(f => ({ ...f, instagram: e.target.value }))} className="bg-card" /></div>
                    <div><Label>Twitter/X</Label><Input value={cardForm.twitter} onChange={e => setCardForm(f => ({ ...f, twitter: e.target.value }))} className="bg-card" /></div>
                    <div>
                      <Label>Organization</Label>
                      <select className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                        value={cardForm.organization_id} onChange={e => setCardForm(f => ({ ...f, organization_id: e.target.value }))}>
                        <option value="">None</option>
                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={cardForm.bio} onChange={e => setCardForm(f => ({ ...f, bio: e.target.value }))} className="bg-card" rows={2} />
                  </div>
                  <Button variant="gold" onClick={addCard}>
                    <Plus className="mr-1 h-4 w-4" /> {editingCard ? 'Update Card' : 'Create Card'}
                  </Button>
                </>
              )}
            </div>

            {/* Cards Table */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> All Cards ({filteredCards.length})
                </h3>
                <select className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground"
                  value={cardOrgFilter} onChange={e => setCardOrgFilter(e.target.value)}>
                  <option value="">All Orgs</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Slug</th>
                      <th className="text-left py-2 hidden sm:table-cell">Org</th>
                      <th className="text-right py-2">Scans</th>
                      <th className="text-right py-2">Active</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCards.map(c => (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="py-2 text-foreground">{c.full_name}</td>
                        <td className="py-2 text-muted-foreground text-xs">/{c.slug}</td>
                        <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">
                          {orgs.find(o => o.id === c.organization_id)?.name || '—'}
                        </td>
                        <td className="py-2 text-right text-primary font-medium">{scans.filter(s => s.card_id === c.id).length}</td>
                        <td className="py-2 text-right">
                          <Switch checked={c.active} onCheckedChange={() => toggleCard(c.id, c.active)} />
                        </td>
                        <td className="py-2 text-right flex items-center justify-end gap-1">
                          <a href={`/${c.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </a>
                          <Button variant="ghost" size="icon" onClick={() => startEditCard(c)} title="Edit">
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCard(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCards.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No cards yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ MANAGEMENT TAB ══════════════════ */}
        {tab === 'management' && (
          <div className="space-y-4">

            {/* ── ORGANIZATIONS ── */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Organizations ({orgs.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowOrgForm(!showOrgForm)}>
                  {showOrgForm ? <ChevronUp className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                </Button>
              </div>

              {showOrgForm && (
                <div className="border border-border rounded-lg p-3 space-y-3 bg-card">
                  <p className="text-xs text-muted-foreground">The owner email becomes the client admin — they can log in and manage their org's cards.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Name *</Label><Input value={orgForm.name} onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" className="bg-background" /></div>
                    <div><Label>Owner Email *</Label><Input type="email" value={orgForm.owner_email} onChange={e => setOrgForm(f => ({ ...f, owner_email: e.target.value }))} placeholder="admin@company.com" className="bg-background" /></div>
                    <div><Label>Email Domain</Label><Input value={orgForm.domain} onChange={e => setOrgForm(f => ({ ...f, domain: e.target.value }))} placeholder="company.com" className="bg-background" /></div>
                    <div><Label>Max Cards</Label><Input type="number" value={orgForm.max_cards} onChange={e => setOrgForm(f => ({ ...f, max_cards: e.target.value }))} className="bg-background" /></div>
                  </div>
                  <Button variant="gold" size="sm" onClick={saveOrg}><Plus className="mr-1 h-4 w-4" /> Create Organization</Button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Admin Email</th>
                      <th className="text-right py-2">Cards</th>
                      <th className="text-right py-2">Active</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map(o => (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{o.name}</td>
                        <td className="py-2 text-muted-foreground text-xs">{o.owner_email}</td>
                        <td className="py-2 text-right">{cards.filter(c => c.organization_id === o.id).length}/{o.max_cards}</td>
                        <td className="py-2 text-right">
                          <span className={o.active ? 'text-green-400' : 'text-destructive'}>{o.active ? '✓' : '✗'}</span>
                        </td>
                        <td className="py-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteOrg(o.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orgs.length === 0 && <p className="text-center py-4 text-muted-foreground text-sm">No organizations yet</p>}
              </div>
            </div>

            {/* ── PROMOS ── */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Megaphone className="h-4 w-4" /> Promos ({promos.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPromoSection(!showPromoSection)}>
                  {showPromoSection ? <ChevronUp className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                </Button>
              </div>

              {showPromoSection && (
                <div className="border border-border rounded-lg p-3 space-y-3 bg-card">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Card *</Label>
                      <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                        value={promoForm.card_id} onChange={e => setPromoForm(p => ({ ...p, card_id: e.target.value }))}>
                        <option value="">Select card...</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.full_name} (/{c.slug})</option>)}
                      </select>
                    </div>
                    <div><Label>Title *</Label><Input value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} className="bg-background" /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} className="bg-background" rows={2} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>CTA Text</Label><Input value={promoForm.cta_text} onChange={e => setPromoForm(p => ({ ...p, cta_text: e.target.value }))} className="bg-background" /></div>
                    <div><Label>CTA URL</Label><Input value={promoForm.cta_url} onChange={e => setPromoForm(p => ({ ...p, cta_url: e.target.value }))} className="bg-background" /></div>
                    <div><Label>Image URL</Label><Input value={promoForm.image_url} onChange={e => setPromoForm(p => ({ ...p, image_url: e.target.value }))} className="bg-background" /></div>
                    <div><Label>Expires</Label><Input type="datetime-local" value={promoForm.expires_at} onChange={e => setPromoForm(p => ({ ...p, expires_at: e.target.value }))} className="bg-background" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="gold" size="sm" onClick={savePromo}>
                      <Plus className="mr-1 h-4 w-4" />{editingPromo ? 'Update' : 'Create'} Promo
                    </Button>
                    {editingPromo && <Button variant="ghost" size="sm" onClick={() => { setEditingPromo(null); setPromoForm({ ...emptyPromo }); }}>Cancel</Button>}
                  </div>
                </div>
              )}

              {promos.length > 0 && (
                <div className="space-y-2">
                  {promos.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-2 rounded-lg border border-border/50">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {cards.find(c => c.id === p.card_id)?.slug || '—'} · {p.active ? 'Active' : 'Off'}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingPromo(p.id);
                          setPromoForm({ card_id: p.card_id, title: p.title, description: p.description || '', cta_text: p.cta_text || '', cta_url: p.cta_url || '', image_url: p.image_url || '', active: p.active, expires_at: p.expires_at || '' });
                          setShowPromoSection(true);
                        }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deletePromo(p.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── BULK IMPORT ── */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Bulk Import
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowBulkSection(!showBulkSection)}>
                  {showBulkSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showBulkSection && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="mr-1 h-4 w-4" /> Template
                    </Button>
                    <select className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                      value={bulkOrg} onChange={e => setBulkOrg(e.target.value)}>
                      <option value="">Select org...</option>
                      {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" /> Upload CSV
                    </Button>
                  </div>
                  {checkingSlug && <p className="text-xs text-muted-foreground">Checking slugs...</p>}

                  {csvRows.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-400">{csvRows.filter((_, i) => !csvErrors[i]).length} valid</span>
                        <span className="text-destructive">{Object.keys(csvErrors).length} invalid</span>
                      </div>
                      <div className="overflow-x-auto max-h-48 overflow-y-auto border border-border rounded-lg">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-card">
                            <tr className="text-muted-foreground border-b border-border">
                              <th className="py-1.5 px-2 text-left">#</th>
                              <th className="py-1.5 px-2 text-left">Name</th>
                              <th className="py-1.5 px-2 text-left">Slug</th>
                              <th className="py-1.5 px-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvRows.map((r, i) => (
                              <tr key={i} className={csvErrors[i] ? 'bg-destructive/10' : 'bg-green-500/5'}>
                                <td className="py-1 px-2">{i + 1}</td>
                                <td className="py-1 px-2">{r.full_name || '—'}</td>
                                <td className="py-1 px-2 font-mono">{r.slug || '—'}</td>
                                <td className="py-1 px-2">{csvErrors[i] ? <span className="text-destructive">✗ {csvErrors[i]}</span> : <span className="text-green-400">✓</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button variant="gold" size="sm" onClick={runImport} disabled={importing || !bulkOrg}>
                        {importing ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Importing...</> : <><Upload className="mr-1 h-4 w-4" /> Import {csvRows.filter((_, i) => !csvErrors[i]).length} Cards</>}
                      </Button>
                    </div>
                  )}

                  {imports.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Import History</p>
                      {imports.map(imp => (
                        <div key={imp.id} className="text-xs text-muted-foreground flex gap-3">
                          <span>{new Date(imp.created_at).toLocaleDateString()}</span>
                          <span>{orgs.find(o => o.id === imp.organization_id)?.name || '—'}</span>
                          <span className="text-green-400">{imp.success_count}✓</span>
                          <span className="text-destructive">{imp.error_count}✗</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
