import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Shield, QrCode, BarChart3, Palette, Users, Smartphone } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-4">
          <div className="text-2xl font-bold tracking-tighter font-headline">
            <span className="gold-text">vCard-OS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/pricing')} className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase font-label">
              Pricing
            </button>
            <button onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase font-label">
              Login
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="editorial-gradient text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:scale-[0.97] active:scale-95 transition-all shadow-lg"
            >
              {user ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-15 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,hsl(42_88%_63%)_0%,transparent_50%)] blur-[120px]"></div>
          </div>

          <div className="relative z-10 max-w-5xl text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-accent/50">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase font-label">The Digital Curator</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-headline tracking-tight leading-[1.1]">
              The Premium Standard for{' '}
              <br className="hidden sm:block" />
              <span className="italic text-primary text-glow">Digital Identity.</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
              Elevate your professional presence with a bespoke digital vault.
              Curated for the modern executive, powered by enterprise-grade luxury.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-delay-2">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="editorial-gradient text-primary-foreground px-10 py-4 rounded-lg font-bold text-lg tracking-tight hover:shadow-[0_0_30px_hsl(42_88%_63%/0.4)] transition-all"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="group flex items-center gap-3 px-10 py-4 border border-border/50 rounded-lg hover:border-primary/40 transition-all"
              >
                <span className="font-semibold">View Plans</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="mt-16 md:mt-20 relative w-full max-w-4xl animate-fade-in-delay-3">
            <div className="glass-panel border border-border/20 p-6 md:p-10 rounded-2xl editorial-shadow specular-highlight">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-high border-2 border-primary/20 flex items-center justify-center">
                    <span className="text-2xl md:text-3xl font-headline font-bold text-primary">J</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-2xl md:text-3xl text-primary">Julian Vane</h2>
                    <p className="text-muted-foreground font-label tracking-widest uppercase text-xs mt-1">Chief Digital Curator</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-foreground/5 p-2 rounded-xl border border-foreground/10">
                    <div className="w-full h-full bg-foreground/10 rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-primary/60" />
                    </div>
                  </div>
                  <div className="flex gap-3 text-primary/50">
                    <Smartphone className="w-5 h-5" />
                    <Users className="w-5 h-5" />
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-20 md:py-32 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Feature 1: Wallet Integration */}
            <div className="md:col-span-8 glass-panel border border-border/15 rounded-2xl p-8 md:p-10 flex flex-col justify-between group hover:bg-accent/40 transition-all specular-highlight">
              <div>
                <div className="text-primary mb-5">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-2xl md:text-3xl mb-3">Save to Google Wallet & Apple Wallet</h3>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
                  Your digital identity, always in your pocket. Save your card to any wallet — no apps needed, no complex setups. Just tap and go.
                </p>
              </div>
              <div className="mt-8 md:mt-12 flex gap-6 md:gap-8 items-center opacity-50">
                <span className="text-lg md:text-xl font-bold font-headline italic text-muted-foreground">Google Wallet</span>
                <span className="text-lg md:text-xl font-bold font-headline italic text-muted-foreground">Apple Wallet</span>
              </div>
            </div>

            {/* Feature 2: Security */}
            <div className="md:col-span-4 bg-accent/30 border border-border/15 rounded-2xl p-8 md:p-10 flex flex-col justify-between hover:border-primary/30 transition-all specular-highlight">
              <div className="text-primary mb-5">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-headline text-xl md:text-2xl mb-3">Enterprise-Grade Security</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your identity is encrypted within our proprietary digital vault. Biometric-ready, protocol-first.
                </p>
              </div>
            </div>

            {/* Feature 3: Analytics */}
            <div className="md:col-span-4 bg-accent/30 border border-border/15 rounded-2xl p-8 md:p-10 hover:border-primary/30 transition-all specular-highlight">
              <div className="text-primary mb-5">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="font-headline text-xl md:text-2xl mb-3">Real-time Lead Capture</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every tap is an opportunity. Track interactions and capture leads directly into your preferred CRM.
              </p>
              {/* Mini chart visual */}
              <div className="mt-6 flex gap-2 items-end h-16">
                {[30, 50, 40, 70, 55, 85, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background: i >= 5 ? 'hsl(42 88% 63%)' : 'hsl(42 70% 42% / 0.5)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Feature 4: Customization */}
            <div className="md:col-span-8 glass-panel border border-border/15 rounded-2xl p-8 md:p-10 group hover:bg-accent/40 transition-all specular-highlight">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-1">
                  <div className="text-primary mb-5">
                    <Palette className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline text-2xl md:text-3xl mb-3">Tailored to Excellence</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Choose from exclusive editorial layouts, 25+ premium themes, and custom brand colors. Your card should be as unique as your fingerprint.
                  </p>
                  <button
                    onClick={() => navigate(user ? '/dashboard' : '/auth')}
                    className="mt-4 text-primary text-xs font-bold tracking-[0.2em] uppercase hover:underline"
                  >
                    Explore Styles →
                  </button>
                </div>
                {/* Theme swatches */}
                <div className="grid grid-cols-4 gap-2">
                  {['#131314', '#f2ca50', '#1a1a2e', '#e5e2e3', '#2c5f2d', '#b85042', '#065a82', '#6d2e46'].map((c) => (
                    <div key={c} className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-border/30" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="glass-panel border border-border/20 rounded-2xl p-10 md:p-16 text-center specular-highlight editorial-shadow">
              <h2 className="font-headline text-3xl md:text-5xl mb-4 leading-tight">
                Ready to curate your <span className="italic text-primary text-glow">legacy?</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-8">
                Join the ranks of elite professionals who have moved beyond the physical card.
              </p>
              <button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className="editorial-gradient text-primary-foreground px-10 py-4 rounded-lg font-bold text-lg hover:shadow-[0_0_30px_hsl(42_88%_63%/0.4)] transition-all"
              >
                Initialize vCard-OS
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-headline italic text-lg gold-text">vCard-OS</span>
            <p className="text-xs text-muted-foreground mt-1">© {new Date().getFullYear()} vCard-OS. The Digital Curator.</p>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <button onClick={() => navigate('/pricing')} className="hover:text-primary transition-colors uppercase tracking-widest">Pricing</button>
            <span className="hover:text-primary transition-colors uppercase tracking-widest cursor-default">Privacy Vault</span>
            <span className="hover:text-primary transition-colors uppercase tracking-widest cursor-default">Global Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
