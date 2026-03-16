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
  Building2, CreditCard, Megaphone, Upload, Download, ExternalLink,
} from 'lucide-react';

const ADMIN_EMAIL = 'gpk330@gmail.com';
type AdminTab = 'overview' | 'organizations' | 'cards' | 'promos' | 'bulk';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [cards, setCards] = useState<CardType[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [imports, setImports] = useState<BulkImport[]>([]);
  const [loading, setLoading] = useState(true);

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
      // NEVER query auth.users — use our own tables only
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
      setLoading(false); // ALWAYS runs
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
  const uniqueUsers = new Set(cards.filter(c => c.user_id).map(c => c.user_id)).size;

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
      toast.success('Organization created');
      setOrgForm({ name: '', owner_email: '', domain: '', max_cards: '10' });
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

  // ─── ADD CARD FORM ───────────────────────────────────────────
  const [cardForm, setCardForm] = useState({
    full_name: '', slug: '', job_title: '', company: '',
    email: '', phone: '', whatsapp: '', organization_id: '',
  });

  const addCard = async () => {
    if (!cardForm.full_name || !cardForm.slug) { toast.error('Name and slug required'); return; }
    try {
      const { error } = await supabase.from('cards').insert({
        // user_id left null — employee will claim it on first login
        user_id: user!.id,
        full_name: cardForm.full_name.trim(),
        slug: cardForm.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
        job_title: cardForm.job_title.trim() || null,
        company: cardForm.company.trim() || null,
        email: cardForm.email.trim() || null,
        phone: cardForm.phone.trim() || null,
        whatsapp: cardForm.whatsapp.trim() || null,
        organization_id: cardForm.organization_id || null,
        active: true,
      });
      if (error) throw error;
      toast.success('Card created — employee can claim it by logging in with their email');
      setCardForm({ full_name: '', slug: '', job_title: '', company: '', email: '', phone: '', whatsapp: '', organization_id: '' });
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

    // Check slugs against database
    setCheckingSlug(true);
    const slugs = rows.map(r => r.slug).filter(s => s && /^[a-z0-9-]{3,30}$/.test(s));
    const { data: existingSlugs } = await supabase.from('cards').select('slug').in('slug', slugs);
    const taken = new Set((existingSlugs || []).map((s: any) => s.slug));
    setCheckingSlug(false);

    const errors: Record<number, string> = {};
    rows.forEach((r, i) => {
      if (!r.full_name) errors[i] = 'full_name missing';
      else if (!r.slug) errors[i] = 'slug missing';
      else if (!/^[a-z0-9-]{3,30}$/.test(r.slug)) errors[i] = 'slug invalid (use lowercase, numbers, hyphens, 3-30 chars)';
      else if (taken.has(r.slug)) errors[i] = 'slug already taken';
    });
    setCsvErrors(errors);
    toast.success(`Parsed ${rows.length} rows — ${rows.length - Object.keys(errors).length} valid, ${Object.keys(errors).length} invalid`);
  };

  const runImport = async () => {
    if (!bulkOrg) { toast.error('Select an organization first'); return; }
    const valid = csvRows.filter((_, i) => !csvErrors[i]);
    if (valid.length === 0) { toast.error('No valid rows to import'); return; }

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
      if (error) {
        errorCount++;
        errorDetails.push({ slug: row.slug, error: error.message });
      } else {
        successCount++;
      }
    }

    // Save import history
    await supabase.from('bulk_imports').insert({
      organization_id: bulkOrg,
      imported_by: user!.id,
      total_rows: csvRows.length,
      success_count: successCount,
      error_count: errorCount + Object.keys(csvErrors).length,
      errors: errorDetails,
    });

    const skipped = Object.keys(csvErrors).length;
    toast.success(`✓ ${successCount} cards created  ✗ ${errorCount} failed  ⚠ ${skipped} skipped (invalid)`);
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

  const adminTabs: { key: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'overview',      label: 'Overview', icon: BarChart3 },
    { key: 'organizations', label: 'Orgs',     icon: Building2 },
    { key: 'cards',         label: 'Cards',    icon: CreditCard },
    { key: 'promos',        label: 'Promos',   icon: Megaphone },
    { key: 'bulk',          label: 'Import',   icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-display font-bold shrink-0">
          <span className="gold-text">Admin</span>
          <span className="text-muted-foreground text-sm font-normal ml-2 hidden sm:inline">{user.email}</span>
        </h1>
        {/* Scrollable tabs — works on mobile */}
        <div className="flex gap-1 ml-auto overflow-x-auto scrollbar-hide">
          {adminTabs.map(t => (
            <Button
              key={t.key}
              variant={tab === t.key ? 'gold' : 'ghost'}
              size="sm"
              onClick={() => setTab(t.key)}
              className="shrink-0"
            >
              <t.icon className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{t.label}</span>
            </Button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 max-w-5xl mx-auto space-y-6">

        {/* ── OVERVIEW ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Total Cards',   value: cards.length },
                { label: 'Active Cards',  value: activeCards },
                { label: 'Organizations', value: orgs.length },
                { label: 'Scans Today',   value: todayScans },
                { label: 'Total Scans',   value: scans.length },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 10 Cards by Scans</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-left py-2 pr-2">#</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Slug</th>
                      <th className="text-left py-2 hidden sm:table-cell">Org</th>
                      <th className="text-right py-2">Scans</th>
                      <th className="text-right py-2">Status</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards
                      .map(c => ({ ...c, scanCount: scans.filter(s => s.card_id === c.id).length }))
                      .sort((a, b) => b.scanCount - a.scanCount)
                      .slice(0, 10)
                      .map((c, i) => (
                        <tr key={c.id} className="border-b border-border/50 hover:bg-accent/5">
                          <td className="py-2 pr-2 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="py-2 text-foreground font-medium">{c.full_name}</td>
                          <td className="py-2 text-muted-foreground text-xs">/{c.slug}</td>
                          <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">
                            {orgs.find(o => o.id === c.organization_id)?.name || '—'}
                          </td>
                          <td className="py-2 text-right text-primary font-semibold">{c.scanCount}</td>
                          <td className="py-2 text-right">
                            <span className={c.active ? 'text-green-400 text-xs' : 'text-destructive text-xs'}>
                              {c.active ? 'Active' : 'Off'}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <a href={`/${c.slug}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {cards.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No cards yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── ORGANIZATIONS ────────────────────────────────────── */}
        {tab === 'organizations' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Add Organization</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input value={orgForm.name} onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))} placeholder="Emirates NBD" className="bg-card" />
                </div>
                <div>
                  <Label>Owner Email *</Label>
                  <Input type="email" value={orgForm.owner_email} onChange={e => setOrgForm(f => ({ ...f, owner_email: e.target.value }))} placeholder="admin@company.com" className="bg-card" />
                  <p className="text-xs text-muted-foreground mt-0.5">This person becomes client admin</p>
                </div>
                <div>
                  <Label>Email Domain (auto-assign)</Label>
                  <Input value={orgForm.domain} onChange={e => setOrgForm(f => ({ ...f, domain: e.target.value }))} placeholder="emiratesnbd.com" className="bg-card" />
                  <p className="text-xs text-muted-foreground mt-0.5">Users with this domain auto-join</p>
                </div>
                <div>
                  <Label>Max Cards</Label>
                  <Input type="number" value={orgForm.max_cards} onChange={e => setOrgForm(f => ({ ...f, max_cards: e.target.value }))} className="bg-card" />
                </div>
              </div>
              <Button variant="gold" onClick={saveOrg}><Plus className="mr-1 h-4 w-4" /> Create Organization</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Owner</th>
                    <th className="text-left py-2 hidden sm:table-cell">Domain</th>
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
                      <td className="py-2 text-muted-foreground hidden sm:table-cell">{o.domain || '—'}</td>
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
              {orgs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No organizations yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CARDS ────────────────────────────────────────────── */}
        {tab === 'cards' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Add Single Card</h3>
              <p className="text-xs text-muted-foreground">Leave user_id empty — employee claims the card by logging in with their email.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={cardForm.full_name}
                    onChange={e => setCardForm(f => ({
                      ...f,
                      full_name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
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
                <div>
                  <Label>Organization</Label>
                  <select className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                    value={cardForm.organization_id} onChange={e => setCardForm(f => ({ ...f, organization_id: e.target.value }))}>
                    <option value="">None</option>
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <Button variant="gold" onClick={addCard}><Plus className="mr-1 h-4 w-4" /> Create Card</Button>
            </div>

            <div>
              <select className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground mb-3"
                value={cardOrgFilter} onChange={e => setCardOrgFilter(e.target.value)}>
                <option value="">All Organizations ({cards.length})</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({cards.filter(c => c.organization_id === o.id).length})</option>)}
              </select>
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
                    <p>No cards {cardOrgFilter ? 'in this organization' : 'yet'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PROMOS ───────────────────────────────────────────── */}
        {tab === 'promos' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">{editingPromo ? 'Edit Promo' : 'New Promo'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Assign to Card *</Label>
                  <select className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                    value={promoForm.card_id} onChange={e => setPromoForm(p => ({ ...p, card_id: e.target.value }))}>
                    <option value="">Select card...</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.full_name} (/{c.slug})</option>)}
                  </select>
                </div>
                <div><Label>Title *</Label><Input value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} className="bg-card" /></div>
              </div>
              <div><Label>Description</Label><Textarea value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} className="bg-card" rows={2} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>CTA Text</Label><Input value={promoForm.cta_text} onChange={e => setPromoForm(p => ({ ...p, cta_text: e.target.value }))} placeholder="Learn More" className="bg-card" /></div>
                <div><Label>CTA URL</Label><Input value={promoForm.cta_url} onChange={e => setPromoForm(p => ({ ...p, cta_url: e.target.value }))} placeholder="https://..." className="bg-card" /></div>
                <div><Label>Image URL</Label><Input value={promoForm.image_url} onChange={e => setPromoForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="bg-card" /></div>
                <div><Label>Expires At</Label><Input type="datetime-local" value={promoForm.expires_at} onChange={e => setPromoForm(p => ({ ...p, expires_at: e.target.value }))} className="bg-card" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={promoForm.active} onCheckedChange={v => setPromoForm(p => ({ ...p, active: v }))} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="gold" onClick={savePromo}>
                  <Plus className="mr-1 h-4 w-4" />{editingPromo ? 'Update' : 'Create'} Promo
                </Button>
                {editingPromo && (
                  <Button variant="ghost" onClick={() => { setEditingPromo(null); setPromoForm({ ...emptyPromo }); }}>Cancel</Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {promos.map(p => (
                <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Card: {cards.find(c => c.id === p.card_id)?.slug || '—'} · {p.active ? 'Active' : 'Inactive'}
                      {p.expires_at && ` · expires ${new Date(p.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingPromo(p.id);
                      setPromoForm({ card_id: p.card_id, title: p.title, description: p.description || '', cta_text: p.cta_text || '', cta_url: p.cta_url || '', image_url: p.image_url || '', active: p.active, expires_at: p.expires_at || '' });
                    }}>Edit</Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePromo(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {promos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No promos yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BULK IMPORT ──────────────────────────────────────── */}
        {tab === 'bulk' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Bulk Import Employees</h3>
              <p className="text-sm text-muted-foreground">
                Upload a CSV to create multiple cards at once. Employees log in with their email to claim their card.
              </p>

              {/* Step 1 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground uppercase tracking-wide">Step 1 — Download Template</p>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="mr-1 h-4 w-4" /> Download CSV Template
                </Button>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground uppercase tracking-wide">Step 2 — Select Organization *</p>
                <select
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                  value={bulkOrg}
                  onChange={e => setBulkOrg(e.target.value)}
                >
                  <option value="">Select organization...</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {orgs.length === 0 && <p className="text-xs text-destructive">Create an organization first (Orgs tab)</p>}
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground uppercase tracking-wide">Step 3 — Upload CSV</p>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-1 h-4 w-4" /> Choose CSV File
                </Button>
                {checkingSlug && <p className="text-xs text-muted-foreground">Checking slugs against database...</p>}
              </div>

              {/* Step 4 — Preview */}
              {csvRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wide">Step 4 — Preview</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-400">{csvRows.filter((_, i) => !csvErrors[i]).length} valid</span>
                      <span className="text-destructive">{Object.keys(csvErrors).length} invalid</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-card">
                        <tr className="text-muted-foreground border-b border-border">
                          <th className="py-2 px-2 text-left">#</th>
                          <th className="py-2 px-2 text-left">Name</th>
                          <th className="py-2 px-2 text-left">Slug</th>
                          <th className="py-2 px-2 text-left">Email</th>
                          <th className="py-2 px-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.map((r, i) => (
                          <tr key={i} className={csvErrors[i] ? 'bg-destructive/10' : 'bg-green-500/5'}>
                            <td className="py-1.5 px-2 text-muted-foreground">{i + 1}</td>
                            <td className="py-1.5 px-2">{r.full_name || '—'}</td>
                            <td className="py-1.5 px-2 font-mono">{r.slug || '—'}</td>
                            <td className="py-1.5 px-2 text-muted-foreground">{r.email || '—'}</td>
                            <td className="py-1.5 px-2">
                              {csvErrors[i]
                                ? <span className="text-destructive">✗ {csvErrors[i]}</span>
                                : <span className="text-green-400">✓ Valid</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    variant="gold"
                    onClick={runImport}
                    disabled={importing || !bulkOrg || csvRows.filter((_, i) => !csvErrors[i]).length === 0}
                  >
                    {importing
                      ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Importing...</>
                      : <><Upload className="mr-1 h-4 w-4" /> Import {csvRows.filter((_, i) => !csvErrors[i]).length} Valid Cards</>}
                  </Button>
                </div>
              )}
            </div>

            {/* Import History */}
            {imports.length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Import History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs border-b border-border">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Organization</th>
                        <th className="text-right py-2">Total</th>
                        <th className="text-right py-2">Success</th>
                        <th className="text-right py-2">Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {imports.map(imp => (
                        <tr key={imp.id} className="border-b border-border/50">
                          <td className="py-2 text-foreground">{new Date(imp.created_at).toLocaleDateString()}</td>
                          <td className="py-2 text-muted-foreground">{orgs.find(o => o.id === imp.organization_id)?.name || '—'}</td>
                          <td className="py-2 text-right">{imp.total_rows}</td>
                          <td className="py-2 text-right text-green-400 font-medium">{imp.success_count}</td>
                          <td className="py-2 text-right text-destructive font-medium">{imp.error_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
