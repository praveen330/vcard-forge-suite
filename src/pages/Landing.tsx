import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QrCode, Smartphone, BarChart3, Shield, ArrowRight } from 'lucide-react';

const features = [
  { icon: QrCode, title: 'Smart QR Codes', desc: 'One scan opens your complete digital profile' },
  { icon: Smartphone, title: 'Save to Contacts', desc: 'vCard download works on every device instantly' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track who views your card and when' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'Built for teams with admin controls and branding' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h2 className="text-xl font-display font-bold">
          <span className="gold-text">VCARD</span><span className="text-foreground">·OS</span>
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')}>
            Pricing
          </Button>
          <Button variant="gold" size="sm" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
            {user ? 'Dashboard' : 'Get Started'}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full border border-border text-xs text-muted-foreground mb-6">
            ✨ The future of networking
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Your digital identity,<br /><span className="gold-text">elevated</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-in-delay">
            Create stunning digital business cards that make lasting impressions. Share via QR code, link, or wallet pass. Track every connection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-delay-2">
            <Button variant="gold" size="xl" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass-card rounded-xl p-6 space-y-3 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground font-sans text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} <span className="gold-text">VCARD·OS</span> — All rights reserved
        </p>
      </footer>
    </div>
  );
}
