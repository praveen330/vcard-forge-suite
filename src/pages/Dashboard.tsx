import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card as CardType, Scan } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Home, Edit, BarChart3, User, LogOut, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QRDisplay } from '@/components/QRDisplay';
import { ScanChart } from '@/components/ScanChart';
import { CardEditor } from '@/components/CardEditor';
import { AvatarUpload } from '@/components/AvatarUpload';

type Tab = 'home' | 'edit' | 'analytics' | 'profile';

const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'edit', label: 'Edit', icon: Edit },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [card, setCard] = useState<CardType | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingCard, setLoadingCard] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadCard();
    loadScans();
  }, [user]);

  const loadCard = async () => {
    if (!user) return;
    setLoadingCard(true);
    const { data } = await supabase.from('cards').select('*').eq('user_id', user.id).limit(1).single();
    setCard(data as CardType | null);
    setLoadingCard(false);
  };

  const loadScans = async () => {
    if (!user || !card) return;
    const { data } = await supabase.from('scans').select('*').eq('card_id', card.id).order('created_at', { ascending: false });
    setScans((data as Scan[]) || []);
  };

  useEffect(() => {
    if (card?.id) loadScans();
  }, [card?.id]);

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const cardUrl = card ? `${appUrl}/${card.slug}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    toast.success('Card link copied!');
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const qrScans = scans.filter(s => s.source === 'qr').length;
  const linkScans = scans.filter(s => s.source === 'link').length;
  const mobileScans = scans.filter(s => s.device === 'mobile').length;
  const desktopScans = scans.filter(s => s.device === 'desktop').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold">
          <span className="gold-text">VCARD</span><span className="text-foreground">·OS</span>
        </h1>
        <div className="hidden md:flex gap-1">
          {tabs.map(t => (
            <Button key={t.key} variant={activeTab === t.key ? 'gold' : 'ghost'} size="sm" onClick={() => setActiveTab(t.key)}>
              <t.icon className="mr-1 h-4 w-4" /> {t.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full overflow-y-auto pb-20 md:pb-6">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">
                Welcome{card?.full_name ? `, ${card.full_name.split(' ')[0]}` : ''}!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {card ? 'Your digital card is live' : 'Create your card to get started'}
              </p>
            </div>

            {card ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <QRDisplay url={cardUrl + '?src=qr'} size={180} />
                  <Button variant="gold" size="sm" onClick={copyLink}>
                    <Copy className="mr-1 h-4 w-4" /> Share Link
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{scans.length}</p>
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{scans.filter(s => {
                      const d = new Date(s.created_at);
                      const week = new Date();
                      week.setDate(week.getDate() - 7);
                      return d >= week;
                    }).length}</p>
                    <p className="text-xs text-muted-foreground">Last 7 Days</p>
                  </div>
                </div>
                {scans.length > 0 && (
                  <div className="glass-card rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Scan Activity</h3>
                    <ScanChart scans={scans} days={7} />
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground mb-4">You haven't created a card yet</p>
                <Button variant="gold" onClick={() => setActiveTab('edit')}>Create Your Card</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="animate-fade-in">
            <CardEditor userId={user.id} card={card} onSave={(c) => { setCard(c); setActiveTab('home'); }} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-bold text-foreground">Analytics</h2>
            {card && scans.length > 0 ? (
              <>
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Scans (14 days)</h3>
                  <ScanChart scans={scans} days={14} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-xs text-muted-foreground mb-2">By Source</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-foreground">QR Code</span><span className="text-primary font-medium">{qrScans}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-foreground">Direct Link</span><span className="text-primary font-medium">{linkScans}</span></div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-xs text-muted-foreground mb-2">By Device</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-foreground">Mobile</span><span className="text-primary font-medium">{mobileScans}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-foreground">Desktop</span><span className="text-primary font-medium">{desktopScans}</span></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">{card ? 'No scans yet. Share your card to start tracking!' : 'Create a card first to see analytics.'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-display font-bold text-foreground">Profile</h2>
            <div className="glass-card rounded-xl p-6 space-y-6">
              <AvatarUpload
                currentUrl={card?.avatar_url || null}
                userId={user.id}
                onUpload={async (url) => {
                  if (card) {
                    await supabase.from('cards').update({ avatar_url: url }).eq('id', card.id);
                    setCard({ ...card, avatar_url: url });
                  }
                }}
              />
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="destructive" size="full" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${activeTab === t.key ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
