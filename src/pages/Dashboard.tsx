import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card as CardType, Scan, Organization } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Home, Edit, BarChart3, User, LogOut, Copy, Loader2, Users, Download, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { QRDisplay } from '@/components/QRDisplay';
import { ScanChart } from '@/components/ScanChart';
import { CardEditor } from '@/components/CardEditor';
import { AvatarUpload } from '@/components/AvatarUpload';
import { TeamTab } from '@/components/TeamTab';

type Tab = 'home' | 'edit' | 'analytics' | 'profile' | 'team';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [card, setCard] = useState<CardType | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingCard, setLoadingCard] = useState(true);
  const [userOrg, setUserOrg] = useState<Organization | null>(null);
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoadingCard(true);
    try {
      // Load card — maybeSingle returns null (not error) when no card exists
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cardError) {
        console.error('Card error:', cardError.message);
        toast.error('Could not load card: ' + cardError.message);
        return;
      }

      // If no card yet, check if employee has a card created by admin with their email
      if (!cardData && user.email) {
        const { data: claimable } = await supabase
          .from('cards')
          .select('*')
          .eq('email', user.email)
          .is('user_id', null)
          .maybeSingle();

        if (claimable) {
          // Claim the card — link it to this user
          await supabase.from('cards').update({ user_id: user.id }).eq('id', claimable.id);
          setCard({ ...claimable, user_id: user.id });
          toast.success('Welcome! Your card has been linked to your account.');
        } else {
          setCard(null);
          // Check domain-based org assignment for new users
          const domain = user.email.split('@')[1];
          if (domain) {
            const { data: orgMatch } = await supabase
              .from('organizations')
              .select('id')
              .eq('domain', domain)
              .eq('active', true)
              .maybeSingle();
            if (orgMatch) setPendingOrgId(orgMatch.id);
          }
        }
      } else {
        setCard(cardData as CardType | null);
      }

      // Load scans for the card
      const resolvedCard = cardData;
      if (resolvedCard?.id) {
        const { data: scanData } = await supabase
          .from('scans')
          .select('*')
          .eq('card_id', resolvedCard.id)
          .order('created_at', { ascending: false });
        setScans((scanData as Scan[]) || []);
      }

      // Check if this user is a client admin
      if (user.email) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_email', user.email)
          .eq('active', true)
          .maybeSingle();
        setUserOrg(orgData as Organization | null);
      }
    } catch (err: any) {
      console.error('loadData error:', err);
      toast.error(err.message || 'Failed to load data');
    } finally {
      // ALWAYS runs — stops the spinner no matter what
      setLoadingCard(false);
    }
  };

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const cardUrl = card ? `${appUrl}/${card.slug}` : '';
  const isAdmin = user?.email === 'gpk330@gmail.com';

  const copyLink = () => {
    if (!cardUrl) { toast.error('Create your card first'); return; }
    navigator.clipboard.writeText(cardUrl);
    toast.success('Card link copied!');
  };

  const exportScansCSV = () => {
    if (scans.length === 0) { toast.error('No scans to export'); return; }
    const header = 'Date,Source,Device\n';
    const rows = scans.map(s => `${s.created_at},${s.source || ''},${s.device || ''}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${card?.slug || 'scans'}-analytics.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  // Show auth loading spinner
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const qrScans = scans.filter(s => s.source === 'qr').length;
  const linkScans = scans.filter(s => s.source === 'link').length;
  const mobileScans = scans.filter(s => s.device === 'mobile').length;
  const desktopScans = scans.filter(s => s.device === 'desktop').length;
  const weekScans = scans.filter(s => new Date(s.created_at) >= new Date(Date.now() - 7 * 86400000)).length;

  const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'edit', label: 'Edit', icon: Edit },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    ...(userOrg ? [{ key: 'team' as Tab, label: 'Team', icon: Users }] : []),
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="text-primary">
              <Shield className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full overflow-y-auto pb-20 md:pb-6">
        {/* Show spinner while loading card data */}
        {loadingCard ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your card...</p>
          </div>
        ) : (
          <>
            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Welcome{card?.full_name ? `, ${card.full_name.split(' ')[0]}` : ''}!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {card ? 'Your digital card is live ✓' : 'Create your card to get started'}
                  </p>
                </div>

                {card ? (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{scans.length}</p>
                        <p className="text-xs text-muted-foreground">Total Scans</p>
                      </div>
                      <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{weekScans}</p>
                        <p className="text-xs text-muted-foreground">This Week</p>
                      </div>
                      <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Today</p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="glass-card rounded-xl p-5 flex flex-col items-center gap-4">
                      <QRDisplay url={cardUrl + '?src=qr'} size={200} />
                    </div>

                    {/* Card URL */}
                    <div className="glass-card rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-2">Your card URL</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-primary bg-background rounded-lg px-3 py-2 truncate">{cardUrl}</code>
                        <Button size="icon" variant="ghost" onClick={copyLink} title="Copy link">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => window.open(cardUrl, '_blank')} title="Open card">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {scans.length > 0 && (
                      <div className="glass-card rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Scan Activity (7 days)</h3>
                        <ScanChart scans={scans} days={7} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card rounded-xl p-8 text-center space-y-3">
                    <p className="text-4xl">🪪</p>
                    <p className="text-muted-foreground">You haven't created a card yet</p>
                    <Button variant="gold" onClick={() => setActiveTab('edit')}>Create Your Card →</Button>
                  </div>
                )}
              </div>
            )}

            {/* EDIT TAB */}
            {activeTab === 'edit' && (
              <div className="animate-fade-in">
                <CardEditor
                  userId={user.id}
                  card={card}
                  organizationId={pendingOrgId}
                  onSave={(c) => {
                    setCard(c);
                    setPendingOrgId(null);
                    loadData();
                    toast.success('Card saved!');
                  }}
                />
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold text-foreground">Analytics</h2>
                  {scans.length > 0 && (
                    <Button variant="outline" size="sm" onClick={exportScansCSV}>
                      <Download className="mr-1 h-4 w-4" /> Export CSV
                    </Button>
                  )}
                </div>

                {card && scans.length > 0 ? (
                  <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'All Time', val: scans.length },
                        { label: 'This Month', val: scans.filter(s => new Date(s.created_at) >= new Date(Date.now() - 30 * 86400000)).length },
                        { label: 'This Week', val: weekScans },
                        { label: 'Today', val: scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length },
                      ].map(s => (
                        <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-primary">{s.val}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="glass-card rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Scans — Last 14 Days</h3>
                      <ScanChart scans={scans} days={14} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="glass-card rounded-xl p-4">
                        <h4 className="text-xs text-muted-foreground mb-3">By Source</h4>
                        {[
                          { label: 'QR Code', val: qrScans },
                          { label: 'Direct Link', val: linkScans },
                          { label: 'Wallet', val: scans.filter(s => s.source === 'wallet').length },
                        ].map(row => (
                          <div key={row.label} className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{row.label}</span>
                              <span className="text-foreground font-medium">{row.val}</span>
                            </div>
                            <div className="h-1.5 bg-border rounded-full">
                              <div className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${scans.length ? (row.val / scans.length) * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="glass-card rounded-xl p-4">
                        <h4 className="text-xs text-muted-foreground mb-3">By Device</h4>
                        {[
                          { label: 'Mobile', val: mobileScans },
                          { label: 'Desktop', val: desktopScans },
                        ].map(row => (
                          <div key={row.label} className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{row.label}</span>
                              <span className="text-foreground font-medium">{row.val}</span>
                            </div>
                            <div className="h-1.5 bg-border rounded-full">
                              <div className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${scans.length ? (row.val / scans.length) * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground">
                      {card ? 'No scans yet — share your card to start tracking!' : 'Create a card first to see analytics.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TEAM TAB — only for client admins */}
            {activeTab === 'team' && userOrg && (
              <TeamTab organization={userOrg} userId={user.id} />
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in max-w-md">
                <h2 className="text-xl font-display font-bold text-foreground">Profile</h2>
                <div className="glass-card rounded-xl p-6 space-y-6">
                  <AvatarUpload
                    currentUrl={card?.avatar_url || null}
                    userId={user.id}
                    userName={card?.full_name || user.email}
                    onUpload={async (url) => {
                      if (!card) { toast.error('Create a card first'); return; }
                      const { error } = await supabase.from('cards').update({ avatar_url: url }).eq('id', card.id);
                      if (error) { toast.error('Failed to save photo'); return; }
                      setCard({ ...card, avatar_url: url });
                      toast.success('Photo updated!');
                    }}
                    onRemove={async () => {
                      if (!card) return;
                      await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
                      await supabase.from('cards').update({ avatar_url: null }).eq('id', card.id);
                      setCard({ ...card, avatar_url: null });
                      toast.success('Photo removed');
                    }}
                  />
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm text-foreground">{user.email}</p>
                    </div>
                    {card?.slug && (
                      <div>
                        <p className="text-xs text-muted-foreground">Card URL</p>
                        <a href={`/${card.slug}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                          {appUrl}/{card.slug}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Member since</p>
                      <p className="text-sm text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="outline" className="w-full text-primary border-primary/30" onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </Button>
                  )}
                  <Button variant="destructive" size="full" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-20">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors ${activeTab === t.key ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
