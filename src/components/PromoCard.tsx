import { Promo } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PromoCardProps {
  promo: Promo;
}

export function PromoCard({ promo }: PromoCardProps) {
  const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
  if (!promo.active || isExpired) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {promo.image_url && (
        <img src={promo.image_url} alt={promo.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-4 space-y-2">
        <h4 className="font-semibold text-foreground">{promo.title}</h4>
        {promo.description && <p className="text-sm text-muted-foreground">{promo.description}</p>}
        {promo.cta_text && promo.cta_url && (
          <Button variant="gold" size="sm" asChild>
            <a href={promo.cta_url} target="_blank" rel="noopener noreferrer">
              {promo.cta_text} <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
