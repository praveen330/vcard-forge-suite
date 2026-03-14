import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">
            <span className="gold-text">VCARD</span><span className="text-foreground">·OS</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {otpSent ? 'Enter the code sent to your email' : 'Sign in with your email'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-card h-12 text-center"
              autoFocus
            />
            <Button variant="gold" size="full" type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Code'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <InputOTPSlot key={i} index={i} className="bg-card border-border" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button variant="gold" size="full" onClick={() => handleVerify()} disabled={loading || otp.length !== 6}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => handleSendOTP()}
              disabled={cooldown > 0 || loading}
            >
              {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => { setOtpSent(false); setOtp(''); setCooldown(0); }}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Change email
            </Button>
          </div>
        )}

        <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => navigate('/')}>
          ← Back to home
        </Button>
      </div>
    </div>
  );
}
