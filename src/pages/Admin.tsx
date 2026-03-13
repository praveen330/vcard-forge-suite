import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card as CardType, Scan, Promo } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Trash2, Plus, Users, CreditCard, BarChart3, Megaphone } from 'lucide-react';

const ADMIN_EMAIL = 'gpk330@gmail.com';
type AdminTab = 'overview' | 'users' | 'cards' | 'promos';

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [cards, setCards] = useState<CardType[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
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
    const [cardsRes, scansRes, promosRes] = await Promise.all([
      supabase.from('cards').select('*').order('created_at', { ascending: false }),
      supabase.from('scans').select('*').order('created_at', { ascending: false }),
      supabase.from('promos').select('*').order('created_at', { ascending: false }),
    ]);
    setCards((cardsRes.data as CardType[]) || []);
    setScans((scansRes.data as Scan[]) || []);
    setPromos((promosRes.data as Promo[]) || []);
    setLoading(false);
  };

  const toggleCard = async (id: string, active: boolean) => {
    await supabase.from('cards').update({ active: !active }).eq('id', id);
    setCards(cards.map(c => c.id === id ? { ...c, active: !active } : c));
    toast.success(`Card ${!active ? 'activated' : 'deactivated'}`);
  };

  const todayScans = scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  // Promo form
  const [promoForm, setPromoForm] = useState({ card_id: '', title: '', description: '', cta_text: '', cta_url: '', image_url: '', active: true, expires_at: '' });
  const [editingPromo, setEditingPromo] = useState<string | null>(null);

  const savePromo = async () => {
    if (!promoForm.card_id || !promoForm.title) { toast.error('Card and title required'); return; }
    try {
      const payload = {
        ...promoForm,
        description: promoForm.description || null,
        cta_text: promoForm.cta_text || null,
        cta_url: promoForm.cta_url || null,
        image_url: promoForm.image_url || null,
        expires_at: promoForm.expires_at || null,
      };
      if (editingPromo) {
        await supabase.from('promos').update(payload).eq('id', editingPromo);
      } else {
        await supabase.from('promos').insert(payload);
      }
      toast.success('Promo saved');
      setEditingPromo(null);
      setPromoForm({ card_id: '', title: '', description: '', cta_text: '', cta_url: '', image_url: '', active: true, expires_at: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deletePromo = async (id: string) => {
    await supabase.from('promos').delete().eq('id', id);
    toast.success('Promo deleted');
    loadData();
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (user?.email !== ADMIN_EMAIL) return null;

  const adminTabs: { key: AdminTab; label: string; icon: typeof Users }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'cards', label: 'Cards', icon: CreditCard },
    { key: 'promos', label: 'Promos', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-display font-bold">
          <span className="gold-text">Admin</span>
        </h1>
        <div className="flex gap-1 ml-auto">
          {adminTabs.map(t => (
            <Button key={t.key} variant={tab === t.key ? 'gold' : 'ghost'} size="sm" onClick={() => setTab(t.key)}>
              <t.icon className="mr-1 h-4 w-4" /> {t.label}
            </Button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{cards.length}</p>
              <p className="text-xs text-muted-foreground">Total Cards</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{scans.length}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{todayScans}</p>
              <p className="text-xs text-muted-foreground">Scans Today</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{promos.length}</p>
              <p className="text-xs text-muted-foreground">Promos</p>
            </div>
          </div>
        )}

        {tab === 'cards' && (
          <div className="space-y-3">
            {cards.map(c => (
              <div key={c.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{c.full_name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug} · {scans.filter(s => s.card_id === c.id).length} scans</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                  <Switch checked={c.active} onCheckedChange={() => toggleCard(c.id, c.active)} />
                </div>
              </div>
            ))}
            {cards.length === 0 && <p className="text-center text-muted-foreground">No cards yet</p>}
          </div>
        )}

        {tab === 'promos' && (
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-foreground">{editingPromo ? 'Edit Promo' : 'New Promo'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Card</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                    value={promoForm.card_id}
                    onChange={e => setPromoForm(p => ({ ...p, card_id: e.target.value }))}
                  >
                    <option value="">Select card...</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.full_name} (/{c.slug})</option>)}
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={promoForm.title} onChange={e => setPromoForm(p => ({ ...p, title: e.target.value }))} className="bg-card" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={promoForm.description} onChange={e => setPromoForm(p => ({ ...p, description: e.target.value }))} className="bg-card" rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>CTA Text</Label>
                  <Input value={promoForm.cta_text} onChange={e => setPromoForm(p => ({ ...p, cta_text: e.target.value }))} className="bg-card" />
                </div>
                <div>
                  <Label>CTA URL</Label>
                  <Input value={promoForm.cta_url} onChange={e => setPromoForm(p => ({ ...p, cta_url: e.target.value }))} className="bg-card" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Image URL</Label>
                  <Input value={promoForm.image_url} onChange={e => setPromoForm(p => ({ ...p, image_url: e.target.value }))} className="bg-card" />
                </div>
                <div>
                  <Label>Expires At</Label>
                  <Input type="datetime-local" value={promoForm.expires_at} onChange={e => setPromoForm(p => ({ ...p, expires_at: e.target.value }))} className="bg-card" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={promoForm.active} onCheckedChange={v => setPromoForm(p => ({ ...p, active: v }))} />
                <Label>Active</Label>
              </div>
              <Button variant="gold" onClick={savePromo}>
                <Plus className="mr-1 h-4 w-4" /> {editingPromo ? 'Update' : 'Create'} Promo
              </Button>
            </div>

            <div className="space-y-3">
              {promos.map(p => (
                <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">Card: {cards.find(c => c.id === p.card_id)?.slug || p.card_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingPromo(p.id);
                      setPromoForm({
                        card_id: p.card_id, title: p.title,
                        description: p.description || '', cta_text: p.cta_text || '',
                        cta_url: p.cta_url || '', image_url: p.image_url || '',
                        active: p.active, expires_at: p.expires_at || '',
                      });
                    }}>Edit</Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePromo(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
