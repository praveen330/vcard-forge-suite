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
import { Loader2, ArrowLeft, Trash2, Plus, BarChart3, Building2, CreditCard, Megaphone, Upload, Download } from 'lucide-react';

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
      toast.error('Failed to load admin data');
    } finally { setLoading(false); }
  };

  const toggleCard = async (id: string, active: boolean) => {
    try {
      await supabase.from('cards').update({ active: !active }).eq('id', id);
      setCards(cards.map(c => c.id === id ? { ...c, active: !active } : c));
      toast.success(`Card ${!active ? 'activated' : 'deactivated'}`);
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Delete this card permanently?')) return;
    try {
      await supabase.from('cards').delete().eq('id', id);
      setCards(cards.filter(c => c.id !== id));
      toast.success('Card deleted');
    } catch (err: any) { toast.error(err.message); }
  };

  const todayScans = scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;
  const activeCards = cards.filter(c => c.active).length;

  // ---- ORG FORM ----
  const [orgForm, setOrgForm] = useState({ name: '', owner_email: '', domain: '', max_cards: '10' });
  const saveOrg = async () => {
    if (!orgForm.name || !orgForm.owner_email) { toast.error('Name and owner email required'); return; }
    try {
      const slug = orgForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const { error } = await supabase.from('organizations').insert({
        name: orgForm.name, slug, owner_email: orgForm.owner_email,
        domain: orgForm.domain || null, max_cards: parseInt(orgForm.max_cards) || 10, active: true,
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
      await supabase.from('organizations').delete().eq('id', id);
      setOrgs(orgs.filter(o => o.id !== id));
      toast.success('Organization deleted');
    } catch (err: any) { toast.error(err.message); }
  };

  // ---- PROMO FORM ----
  const [promoForm, setPromoForm] = useState({ card_id: '', title: '', description: '', cta_text: '', cta_url: '', image_url: '', active: true, expires_at: '' });
  const [editingPromo, setEditingPromo] = useState<string | null>(null);
  const savePromo = async () => {
    if (!promoForm.card_id || !promoForm.title) { toast.error('Card and title required'); return; }
    try {
      const payload = {
        ...promoForm,
        description: promoForm.description || null, cta_text: promoForm.cta_text || null,
        cta_url: promoForm.cta_url || null, image_url: promoForm.image_url || null,
        expires_at: promoForm.expires_at || null,
      };
      if (editingPromo) {
        const { error } = await supabase.from('promos').update(payload).eq('id', editingPromo);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('promos').insert(payload);
        if (error) throw error;
      }
      toast.success('Promo saved');
      setEditingPromo(null);
      setPromoForm({ card_id: '', title: '', description: '', cta_text: '', cta_url: '', image_url: '', active: true, expires_at: '' });
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };
  const deletePromo = async (id: string) => {
    try {
      await supabase.from('promos').delete().eq('id', id);
      toast.success('Promo deleted');
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  // ---- CARD ADD ----
  const [cardForm, setCardForm] = useState({ full_name: '', slug: '', job_title: '', company: '', email: '', phone: '', whatsapp: '', organization_id: '' });
  const addCard = async () => {
    if (!cardForm.full_name || !cardForm.slug) { toast.error('Name and slug required'); return; }
    try {
      const { error } = await supabase.from('cards').insert({
        user_id: user!.id,
        full_name: cardForm.full_name.trim(), slug: cardForm.slug.trim(),
        job_title: cardForm.job_title.trim() || null, company: cardForm.company.trim() || null,
        email: cardForm.email.trim() || null, phone: cardForm.phone.trim() || null,
        whatsapp: cardForm.whatsapp.trim() || null,
        organization_id: cardForm.organization_id || null,
        active: true,
      });
      if (error) throw error;
      toast.success('Card created');
      setCardForm({ full_name: '', slug: '', job_title: '', company: '', email: '', phone: '', whatsapp: '', organization_id: '' });
      loadData();
    } catch (err: any) { toast.error(err.message); }
  };

  // ---- BULK IMPORT ----
  const fileRef = useRef<HTMLInputElement>(null);
  const [bulkOrg, setBulkOrg] = useState('');
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const csv = 'full_name,job_title,company,email,phone,whatsapp,linkedin,instagram,twitter,slug\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vcard-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ''; });
      return row;
    });
    setCsvRows(rows);

    // Validate
    const slugs = rows.map(r => r.slug).filter(Boolean);
    const { data: existingSlugs } = await supabase.from('cards').select('slug').in('slug', slugs);
    const taken = new Set((existingSlugs || []).map((s: any) => s.slug));
    const errors: Record<number, string> = {};
    rows.forEach((r, i) => {
      if (!r.full_name) errors[i] = 'full_name missing';
      else if (!r.slug) errors[i] = 'slug missing';
      else if (!/^[a-z0-9-]{3,30}$/.test(r.slug)) errors[i] = 'slug invalid format';
      else if (taken.has(r.slug)) errors[i] = 'slug taken';
    });
    setCsvErrors(errors);
  };

  const runImport = async () => {
    if (!bulkOrg) { toast.error('Select an organization'); return; }
    setImporting(true);
    const valid = csvRows.filter((_, i) => !csvErrors[i]);
    let successCount = 0, errorCount = 0;
    const errorDetails: any[] = [];

    for (const row of valid) {
      const { error } = await supabase.from('cards').insert({
        user_id: user!.id,
        organization_id: bulkOrg,
        full_name: row.full_name, slug: row.slug,
        job_title: row.job_title || null, company: row.company || null,
        email: row.email || null, phone: row.phone || null,
        whatsapp: row.whatsapp || null, linkedin: row.linkedin || null,
        instagram: row.instagram || null, twitter: row.twitter || null,
        active: true,
      });
      if (error) { errorCount++; errorDetails.push({ slug: row.slug, error: error.message }); }
      else successCount++;
    }

    // Log import
    await supabase.from('bulk_imports').insert({
      organization_id: bulkOrg, imported_by: user!.id,
      total_rows: csvRows.length, success_count: successCount,
      error_count: errorCount + Object.keys(csvErrors).length,
      errors: errorDetails,
    });

    toast.success(`✓ ${successCount} cards created  ✗ ${errorCount + Object.keys(csvErrors).length} failed`);
    setCsvRows([]); setCsvErrors({});
    setImporting(false);
    loadData();
  };

  // ---- ORG FILTER FOR CARDS ----
  const [cardOrgFilter, setCardOrgFilter] = useState('');

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (user?.email !== ADMIN_EMAIL) return null;

  const adminTabs: { key: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'organizations', label: 'Orgs', icon: Building2 },
    { key: 'cards', label: 'Cards', icon: CreditCard },
    { key: 'promos', label: 'Promos', icon: Megaphone },
    { key: 'bulk', label: 'Import', icon: Upload },
  ];

  const filteredCards = cardOrgFilter ? cards.filter(c => c.organization_id === cardOrgFilter) : cards;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 overflow-x-auto">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-display font-bold shrink-0"><span className="gold-text">Admin</span></h1>
        <div className="flex gap-1 ml-auto">
          {adminTabs.map(t => (
            <Button key={t.key} variant={tab === t.key ? 'gold' : 'ghost'} size="sm" onClick={() => setTab(t.key)} className="shrink-0">
              <t.icon className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">{t.label}</span>
            </Button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Total Cards', value: cards.length },
                { label: 'Active Cards', value: activeCards },
                { label: 'Organizations', value: orgs.length },
                { label: 'Scans Today', value: todayScans },
                { label: 'Total Scans', value: scans.length },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 10 Cards by Scans</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-2">Name</th><th className="text-left py-2">Slug</th><th className="text-left py-2">Org</th><th className="text-right py-2">Scans</th><th className="text-right py-2">Status</th>
                  </tr></thead>
                  <tbody>
                    {cards
                      .map(c => ({ ...c, scanCount: scans.filter(s => s.card_id === c.id).length }))
                      .sort((a, b) => b.scanCount - a.scanCount)
                      .slice(0, 10)
                      .map(c => (
                        <tr key={c.id} className="border-b border-border/50">
                          <td className="py-2 text-foreground">{c.full_name}</td>
                          <td className="py-2 text-muted-foreground">/{c.slug}</td>
                          <td className="py-2 text-muted-foreground">{orgs.find(o => o.id === c.organization_id)?.name || '—'}</td>
                          <td className="py-2 text-right text-primary font-medium">{c.scanCount}</td>
                          <td className="py-2 text-right"><span className={c.active ? 'text-green-400' : 'text-destructive'}>{c.active ? 'Active' : 'Off'}</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ORGANIZATIONS */}
        {tab === 'organizations' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Add Organization</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Name *</Label><Input value={orgForm.name} onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))} className="bg-card" /></div>
                <div><Label>Owner Email *</Label><Input value={orgForm.owner_email} onChange={e => setOrgForm(f => ({ ...f, owner_email: e.target.value }))} className="bg-card" /></div>
                <div><Label>Domain</Label><Input value={orgForm.domain} onChange={e => setOrgForm(f => ({ ...f, domain: e.target.value }))} placeholder="company.com" className="bg-card" /></div>
                <div><Label>Max Cards</Label><Input type="number" value={orgForm.max_cards} onChange={e => setOrgForm(f => ({ ...f, max_cards: e.target.value }))} className="bg-card" /></div>
              </div>
              <Button variant="gold" onClick={saveOrg}><Plus className="mr-1 h-4 w-4" /> Create</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-2">Name</th><th className="text-left py-2">Owner</th><th className="text-left py-2">Domain</th>
                  <th className="text-right py-2">Cards</th><th className="text-right py-2">Active</th><th className="text-right py-2"></th>
                </tr></thead>
                <tbody>
                  {orgs.map(o => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{o.name}</td>
                      <td className="py-2 text-muted-foreground text-xs">{o.owner_email}</td>
                      <td className="py-2 text-muted-foreground">{o.domain || '—'}</td>
                      <td className="py-2 text-right">{cards.filter(c => c.organization_id === o.id).length}/{o.max_cards}</td>
                      <td className="py-2 text-right"><span className={o.active ? 'text-green-400' : 'text-destructive'}>{o.active ? 'Yes' : 'No'}</span></td>
                      <td className="py-2 text-right"><Button variant="ghost" size="icon" onClick={() => deleteOrg(o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orgs.length === 0 && <p className="text-center text-muted-foreground py-4">No organizations yet</p>}
            </div>
          </div>
        )}

        {/* CARDS */}
        {tab === 'cards' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Add Card</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Full Name *</Label><Input value={cardForm.full_name} onChange={e => setCardForm(f => ({ ...f, full_name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) }))} className="bg-card" /></div>
                <div><Label>Slug *</Label><Input value={cardForm.slug} onChange={e => setCardForm(f => ({ ...f, slug: e.target.value }))} className="bg-card" /></div>
                <div><Label>Job Title</Label><Input value={cardForm.job_title} onChange={e => setCardForm(f => ({ ...f, job_title: e.target.value }))} className="bg-card" /></div>
                <div><Label>Company</Label><Input value={cardForm.company} onChange={e => setCardForm(f => ({ ...f, company: e.target.value }))} className="bg-card" /></div>
                <div><Label>Email</Label><Input value={cardForm.email} onChange={e => setCardForm(f => ({ ...f, email: e.target.value }))} className="bg-card" /></div>
                <div>
                  <Label>Organization</Label>
                  <select className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground" value={cardForm.organization_id} onChange={e => setCardForm(f => ({ ...f, organization_id: e.target.value }))}>
                    <option value="">None</option>
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <Button variant="gold" onClick={addCard}><Plus className="mr-1 h-4 w-4" /> Create Card</Button>
            </div>

            <div>
              <select className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground mb-3" value={cardOrgFilter} onChange={e => setCardOrgFilter(e.target.value)}>
                <option value="">All Organizations</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-2">Name</th><th className="text-left py-2">Slug</th><th className="text-left py-2">Org</th>
                    <th className="text-right py-2">Scans</th><th className="text-right py-2">Active</th><th className="text-right py-2"></th>
                  </tr></thead>
                  <tbody>
                    {filteredCards.map(c => (
                      <tr key={c.id} className="border-b border-border/50">
                        <td className="py-2 text-foreground">{c.full_name}</td>
                        <td className="py-2 text-muted-foreground">/{c.slug}</td>
                        <td className="py-2 text-muted-foreground text-xs">{orgs.find(o => o.id === c.organization_id)?.name || '—'}</td>
                        <td className="py-2 text-right text-primary">{scans.filter(s => s.card_id === c.id).length}</td>
                        <td className="py-2 text-right"><Switch checked={c.active} onCheckedChange={() => toggleCard(c.id, c.active)} /></td>
                        <td className="py-2 text-right"><Button variant="ghost" size="icon" onClick={() => deleteCard(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCards.length === 0 && <p className="text-center text-muted-foreground py-4">No cards</p>}
              </div>
            </div>
          </div>
        )}

        {/* PROMOS */}
        {tab === 'promos' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">{editingPromo ? 'Edit Promo' : 'New Promo'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Card</Label>
                  <select className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground" value={promoForm.card_id} onChange={e => setPromoForm(p => ({ ...p, card_id: e.target.value }))}>
                    <option value="">Select card...</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.full_name} (/{c.slug})</option>)}
                  </select>
                </div>
                <div><Label>Title</Label><Input value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} className="bg-card" /></div>
              </div>
              <div><Label>Description</Label><Textarea value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} className="bg-card" rows={2} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>CTA Text</Label><Input value={promoForm.cta_text} onChange={e => setPromoForm(p => ({ ...p, cta_text: e.target.value }))} className="bg-card" /></div>
                <div><Label>CTA URL</Label><Input value={promoForm.cta_url} onChange={e => setPromoForm(p => ({ ...p, cta_url: e.target.value }))} className="bg-card" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Image URL</Label><Input value={promoForm.image_url} onChange={e => setPromoForm(p => ({ ...p, image_url: e.target.value }))} className="bg-card" /></div>
                <div><Label>Expires At</Label><Input type="datetime-local" value={promoForm.expires_at} onChange={e => setPromoForm(p => ({ ...p, expires_at: e.target.value }))} className="bg-card" /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={promoForm.active} onCheckedChange={v => setPromoForm(p => ({ ...p, active: v }))} /><Label>Active</Label></div>
              <div className="flex gap-2">
                <Button variant="gold" onClick={savePromo}><Plus className="mr-1 h-4 w-4" /> {editingPromo ? 'Update' : 'Create'} Promo</Button>
                {editingPromo && <Button variant="ghost" onClick={() => { setEditingPromo(null); setPromoForm({ card_id: '', title: '', description: '', cta_text: '', cta_url: '', image_url: '', active: true, expires_at: '' }); }}>Cancel</Button>}
              </div>
            </div>
            <div className="space-y-3">
              {promos.map(p => (
                <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">Card: {cards.find(c => c.id === p.card_id)?.slug || p.card_id} · {p.active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingPromo(p.id);
                      setPromoForm({ card_id: p.card_id, title: p.title, description: p.description || '', cta_text: p.cta_text || '', cta_url: p.cta_url || '', image_url: p.image_url || '', active: p.active, expires_at: p.expires_at || '' });
                    }}>Edit</Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePromo(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {promos.length === 0 && <p className="text-center text-muted-foreground">No promos yet</p>}
            </div>
          </div>
        )}

        {/* BULK IMPORT */}
        {tab === 'bulk' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">Bulk Import Cards</h3>
              <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="mr-1 h-4 w-4" /> Download CSV Template</Button>
              <div>
                <Label>Organization *</Label>
                <select className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground" value={bulkOrg} onChange={e => setBulkOrg(e.target.value)}>
                  <option value="">Select...</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Upload CSV</Label>
                <Input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="bg-card" />
              </div>

              {csvRows.length > 0 && (
                <>
                  <div className="overflow-x-auto max-h-60 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-muted-foreground border-b border-border">
                        <th className="py-1 text-left">#</th><th className="py-1 text-left">Name</th><th className="py-1 text-left">Slug</th><th className="py-1 text-left">Status</th>
                      </tr></thead>
                      <tbody>
                        {csvRows.map((r, i) => (
                          <tr key={i} className={csvErrors[i] ? 'bg-destructive/10' : 'bg-green-500/10'}>
                            <td className="py-1">{i + 1}</td>
                            <td className="py-1">{r.full_name}</td>
                            <td className="py-1">{r.slug}</td>
                            <td className="py-1">{csvErrors[i] ? <span className="text-destructive">{csvErrors[i]}</span> : <span className="text-green-400">Valid</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="gold" onClick={runImport} disabled={importing || !bulkOrg || csvRows.filter((_, i) => !csvErrors[i]).length === 0}>
                    {importing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                    Import {csvRows.filter((_, i) => !csvErrors[i]).length} valid cards
                  </Button>
                </>
              )}
            </div>

            {imports.length > 0 && (
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Import History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-left py-2">Date</th><th className="text-left py-2">Org</th><th className="text-right py-2">Total</th><th className="text-right py-2">Success</th><th className="text-right py-2">Failed</th>
                    </tr></thead>
                    <tbody>
                      {imports.map(imp => (
                        <tr key={imp.id} className="border-b border-border/50">
                          <td className="py-2 text-foreground">{new Date(imp.created_at).toLocaleDateString()}</td>
                          <td className="py-2 text-muted-foreground">{orgs.find(o => o.id === imp.organization_id)?.name || '—'}</td>
                          <td className="py-2 text-right">{imp.total_rows}</td>
                          <td className="py-2 text-right text-green-400">{imp.success_count}</td>
                          <td className="py-2 text-right text-destructive">{imp.error_count}</td>
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
