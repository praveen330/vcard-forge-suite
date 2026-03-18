import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/forever',
    description: 'Perfect for individuals getting started',
    features: [
      '1 Digital Business Card',
      'QR Code Generation',
      'Save to Contacts (vCard)',
      'Basic Themes',
      'Gallery (up to 4 images)',
      'Share via Link',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    description: 'For professionals who want to stand out',
    features: [
      'Everything in Free',
      'Unlimited Cards',
      'Premium Themes & Colors',
      'Company Logo Branding',
      'Product & Link Sections',
      'Gallery (up to 8 images)',
      'Wallet Card Download',
      'Analytics Dashboard',
      'Priority Support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '₹999',
    period: '/month',
    description: 'For teams & organizations',
    features: [
      'Everything in Pro',
      'Up to 50 Employee Cards',
      'Team Management Dashboard',
      'Bulk CSV Import',
      'Client Admin Panel',
      'Promotional Banners',
      'Custom Domain Support',
      'Domain Auto-Assignment',
      'Dedicated Account Manager',
      'White-label Options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xl font-display font-bold">
            <span className="gold-text">VCARD</span><span className="text-foreground">·OS</span>
          </h2>
        </button>
        <Button variant="gold" size="sm" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
          {user ? 'Dashboard' : 'Get Started'}
        </Button>
      </nav>

      {/* Header */}
      <section className="px-6 pt-12 pb-8 max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full border border-border text-xs text-muted-foreground mb-4">
          💎 Simple, transparent pricing
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Choose your <span className="gold-text">plan</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Start free, upgrade when you need more. No hidden fees, cancel anytime.
        </p>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass-card rounded-2xl p-6 flex flex-col ${
                plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <div className="mt-3 mb-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? 'gold' : 'outline'}
                className="w-full"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
              >
                {plan.cta} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
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
