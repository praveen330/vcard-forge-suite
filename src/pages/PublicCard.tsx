import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card as CardType, Promo } from '@/types/database';
import { CardView } from '@/components/CardView';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PublicCard() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [card, setCard] = useState<CardType | null>(null);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadCard();
  }, [slug]);

  const loadCard = async () => {
    const { data, error } = await supabase.from('cards').select('*').eq('slug', slug).eq('active', true).single();
    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setCard(data as CardType);

    // Load promos
    const { data: promoData } = await supabase.from('promos').select('*').eq('card_id', data.id).eq('active', true);
    const activePromos = (promoData as Promo[] || []).filter(p => !p.expires_at || new Date(p.expires_at) > new Date());
    setPromos(activePromos);

    setLoading(false);

    // Log scan (fire and forget)
    const source = searchParams.get('src') === 'qr' ? 'qr' : 'link';
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    supabase.from('scans').insert({
      card_id: data.id,
      source,
      device: isMobile ? 'mobile' : 'desktop',
    }).then(() => {});
  };

  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-display font-bold text-foreground">Card Not Found</h1>
          <p className="text-muted-foreground text-sm">This card doesn't exist or has been deactivated.</p>
        </div>
      </div>
    );
  }

  const ogDesc = [card.job_title, card.company].filter(Boolean).join(' at ');

  return (
    <>
      <title>{card.full_name} — VCARD·OS</title>
      <meta name="description" content={ogDesc || card.full_name} />
      <meta property="og:title" content={card.full_name} />
      <meta property="og:description" content={ogDesc || 'Digital Business Card'} />
      {card.avatar_url && <meta property="og:image" content={card.avatar_url} />}
      <meta property="og:type" content="profile" />
      <CardView card={card} promos={promos} appUrl={appUrl} />
    </>
  );
}
