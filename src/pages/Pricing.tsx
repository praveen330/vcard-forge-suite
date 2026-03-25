import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Check, ArrowRight, ArrowLeft, Shield, Users, BarChart3 } from 'lucide-react';

const plans = [
  {
    name: 'Monthly',
    subtitle: 'Flexible Scaling',
    price: '₹499',
    period: '/month',
    note: 'Per activated card',
    features: [
      '1 Digital Business Card',
      'QR Code Generation',
      'Save to Contacts (vCard)',
      'Basic Themes',
      'Gallery (up to 4 images)',
      'Share via Link',
      'Email Support',
    ],
    cta: 'Select Plan',
    popular: false,
  },
  {
    name: 'Yearly',
    subtitle: 'Institutional Choice',
    price: '₹2,999',
    period: '/year',
    note: 'Save over 50% annually',
    features: [
      'Unlimited Cards',
      'Premium Themes & Custom Colors',
      'Company Logo Branding',
      'Product & Link Sections',
      'Gallery (up to 8 images)',
      'Wallet Card Download',
      'Analytics Dashboard',
      'Priority Support',
      'Bulk CSV Provisioning',
    ],
    cta: 'Upgrade to Yearly',
    popular: true,
  },
  {
    name: 'Quarterly',
    subtitle: 'Balanced Commitment',
    price: '₹999',
    period: '/quarter',
    note: 'Billed every 90 days',
    features: [
      'Everything in Monthly',
      'Custom Color Palettes',
      'Extended History Logs',
      'Standard Directory Tools',
      'Up to 10 Employee Cards',
      'Team Management',
    ],
    cta: 'Select Plan',
    popular: false,
  },
];

const trustFeatures = [
  { icon: Shield, title: 'Compliance', desc: 'GDPR & SOC2 Type II Certified for absolute data sovereignty.' },
  { icon: Users, title: 'Centralized Control', desc: 'Update 10,000 cards in a single click with our enterprise deployment engine.' },
  { icon: BarChart3, title: 'Precision Analytics', desc: 'Track engagement across every touchpoint. From QR scans to NFC taps.' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span className="font-headline italic text-xl gold-text tracking-tighter">vCard-OS</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="editorial-gradient text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:scale-[0.97] transition-all"
            >
              {user ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-16 md:mb-24 animate-fade-in">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-accent border border-border/30">
            <span className="text-primary text-xs font-label uppercase tracking-widest font-medium">Enterprise Identity Infrastructure</span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight">
            The Aureum Standard.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Secure, scalable, and sophisticated digital identity for modern institutions.
            Deploy vCards across your entire organization with surgical precision.
          </p>
        </header>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-32 relative animate-fade-in-delay">
          {/* Background glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-8 md:p-10 flex flex-col specular-highlight transition-all ${
                plan.popular
                  ? 'bg-surface-high border border-primary/20 md:scale-105 editorial-shadow z-10'
                  : 'bg-accent/30 border border-border/15 hover:border-primary/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1 uppercase tracking-wider rounded-bl-lg rounded-tr-xl">
                  Best Value
                </div>
              )}

              <div className="mb-6 md:mb-8">
                <h3 className={`font-headline text-xl md:text-2xl mb-1 ${plan.popular ? 'text-primary' : ''}`}>{plan.name}</h3>
                <p className="text-muted-foreground text-xs font-label uppercase tracking-widest">{plan.subtitle}</p>
              </div>

              <div className="mb-8 md:mb-10">
                <span className="font-headline text-3xl md:text-4xl text-primary">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
                <p className={`text-xs mt-2 ${plan.popular ? 'text-primary font-semibold' : 'text-muted-foreground italic'}`}>
                  {plan.note}
                </p>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                className={`w-full py-3.5 md:py-4 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'editorial-gradient text-primary-foreground shadow-lg hover:brightness-110'
                    : 'border border-border text-foreground hover:bg-accent'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise Volume Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 md:mb-32 animate-fade-in-delay-2">
          <div className="space-y-6">
            <h2 className="font-headline text-3xl md:text-4xl">Company Volume Discount</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Deploying for a workforce of 100+? Our algorithmic pricing scales with your organization.
              Enter your headcount for an instant estimate.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Enterprise-Ready', 'SSO Support', 'Bulk Management'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent border border-border/30 text-xs font-label font-medium tracking-wider uppercase">
                  <Shield className="w-3 h-3 text-primary" /> {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-panel border border-border/15 rounded-xl p-8 specular-highlight">
            <p className="text-xs text-muted-foreground font-label uppercase tracking-widest mb-4">Custom Enterprise Quote</p>
            <div className="text-center py-8">
              <p className="font-headline text-4xl text-primary mb-2">Custom Pricing</p>
              <p className="text-muted-foreground text-sm">Tailored to your organization's scale</p>
            </div>
            <button
              onClick={() => window.open('mailto:sales@vcard-os.com')}
              className="w-full py-4 bg-accent border border-border text-foreground font-semibold rounded-lg hover:border-primary/30 transition-all"
            >
              Request Custom Quote
            </button>
          </div>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-delay-3">
          {trustFeatures.map((f) => (
            <div key={f.title} className="glass-panel border border-border/15 rounded-xl p-8 specular-highlight hover:border-primary/20 transition-all">
              <f.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-headline text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-headline italic text-lg gold-text">vCard-OS</span>
            <p className="text-xs text-muted-foreground mt-1">© {new Date().getFullYear()} vCard-OS. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            {['Privacy Policy', 'Terms of Service', 'Compliance'].map(l => (
              <span key={l} className="hover:text-primary transition-colors uppercase tracking-widest cursor-default">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
