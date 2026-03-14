import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, Card } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, UserPlus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface TeamTabProps {
  organization: Organization;
  userId: string;
}

export function TeamTab({ organization, userId }: TeamTabProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', job_title: '', company: organization.name, email: '',
    phone: '', whatsapp: '', slug: '',
  });

  useEffect(() => { loadCards(); }, [organization.id]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cards').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false });
      if (error) throw error;
      setCards((data as Card[]) || []);
    } catch (err: any) {
      toast.error('Failed to load team cards');
    } finally { setLoading(false); }
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);

  const handleAdd = async () => {
    if (!form.full_name.trim() || !form.slug.trim()) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('cards').insert({
        user_id: userId,
        organization_id: organization.id,
        full_name: form.full_name.trim(),
        slug: form.slug.trim(),
        job_title: form.job_title.trim() || null,
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        active: true,
      }).select().single();
      if (error) throw error;
      toast.success('Employee card created!');
      setShowForm(false);
      setForm({ full_name: '', job_title: '', company: organization.name, email: '', phone: '', whatsapp: '', slug: '' });
      loadCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create card');
    } finally { setSaving(false); }
  };

  const toggleCard = async (id: string, active: boolean) => {
    try {
      await supabase.from('cards').update({ active: !active }).eq('id', id);
      setCards(cards.map(c => c.id === id ? { ...c, active: !active } : c));
      toast.success(`Card ${!active ? 'activated' : 'deactivated'}`);
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Team</h2>
          <p className="text-sm text-muted-foreground">{organization.name}</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-1 h-4 w-4" /> : <UserPlus className="mr-1 h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Employee'}
        </Button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={e => { setForm(f => ({ ...f, full_name: e.target.value, slug: autoSlug(e.target.value) })); }} className="bg-card" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="bg-card" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Job Title</Label><Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} className="bg-card" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="bg-card" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-card" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-card" /></div>
          </div>
          <Button variant="gold" onClick={handleAdd} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />} Create Card
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : cards.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No team cards yet. Add your first employee!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(c => (
            <div key={c.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{c.full_name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug} · {c.job_title || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${c.active ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                  {c.active ? 'Active' : 'Inactive'}
                </span>
                <Switch checked={c.active} onCheckedChange={() => toggleCard(c.id, c.active)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
