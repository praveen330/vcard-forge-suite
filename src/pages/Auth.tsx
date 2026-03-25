import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
      if (error) throw error;
      setOtpSent(true);
      setCooldown(60);
      toast.success('Code sent! Check your email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback(async (code?: string) => {
    const token = code || otp;
    if (token.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      toast.success('Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }, [email, otp, navigate]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) handleVerify(value);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Ambient background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter text-primary mb-2">vCard-OS</h1>
          <p className="text-muted-foreground font-label text-sm tracking-[0.2em] uppercase">The Digital Curator</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel border border-border/15 rounded-xl p-8 md:p-10 editorial-shadow specular-highlight">
          {/* Security Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-border/30">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-label font-medium tracking-widest text-muted-foreground uppercase">Secured Access</span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-xl md:text-2xl font-headline mb-2">
              {otpSent ? 'Verify Identity' : 'Secure Access'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {otpSent ? 'Enter the code sent to your email' : 'Verify your identity to enter the vault.'}
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-[10px] font-label font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Vault Identifier
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="curator@vcard-os.com"
                  className="w-full bg-transparent border-b border-border/40 py-3 text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-all font-label"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 editorial-gradient text-primary-foreground font-bold tracking-tight rounded-lg shadow-[0_10px_30px_hsl(42_88%_63%/0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Access Code'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">
                    Authentication Code
                  </label>
                  <span className="text-[10px] text-muted-foreground">Step 2 of 2</span>
                </div>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="bg-accent border-border/30 text-foreground font-headline text-lg w-11 h-13"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 editorial-gradient text-primary-foreground font-bold tracking-tight rounded-lg shadow-[0_10px_30px_hsl(42_88%_63%/0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Secure Login'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendOTP()}
                  disabled={cooldown > 0 || loading}
                  className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-primary border border-border/20 rounded-lg transition-all disabled:opacity-40"
                >
                  {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                </button>
                <button
                  onClick={() => { setOtpSent(false); setOtp(''); setCooldown(0); }}
                  className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-primary border border-border/20 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center space-y-3">
          <button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-wide">
            ← Back to home
          </button>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 text-center">
        <p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase">
          Authority of vCard-OS Global Ecosystem
        </p>
      </div>
    </div>
  );
}
