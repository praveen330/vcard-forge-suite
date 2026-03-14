import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (_event === 'SIGNED_IN' && session?.user) {
        // Check org auto-assign
        const email = session.user.email;
        if (email) {
          const domain = email.split('@')[1];
          if (domain) {
            const { data: org } = await supabase
              .from('organizations')
              .select('id')
              .eq('domain', domain)
              .eq('active', true)
              .limit(1)
              .maybeSingle();
            if (org) setPendingOrgId(org.id);
          }
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut, pendingOrgId };
}
