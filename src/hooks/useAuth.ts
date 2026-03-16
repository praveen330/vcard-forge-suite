import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (_event === 'SIGNED_IN' && session?.user?.email) {
        const email = session.user.email;
        const domain = email.split('@')[1];
        if (!domain) return;

        void (async () => {
          try {
            const { data: org } = await supabase
              .from('organizations')
              .select('id')
              .eq('domain', domain)
              .eq('active', true)
              .limit(1)
              .maybeSingle();

            if (!mounted) return;
            setPendingOrgId(org?.id ?? null);
          } catch (error) {
            console.error('Org auto-assign check failed:', error);
          }
        })();
      } else {
        setPendingOrgId(null);
      }
    });

    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut, pendingOrgId };
}
