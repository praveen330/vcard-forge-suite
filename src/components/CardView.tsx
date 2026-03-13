import { Card } from '@/types/database';
import { Promo } from '@/types/database';
import { CardActionButtons } from '@/components/WalletButtons';
import { PromoCard } from '@/components/PromoCard';
import { QRDisplay } from '@/components/QRDisplay';

interface CardViewProps {
  card: Card;
  promos?: Promo[];
  appUrl: string;
}

export function CardView({ card, promos = [], appUrl }: CardViewProps) {
  const publicUrl = `${appUrl}/${card.slug}`;

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full border-[3px] border-primary overflow-hidden bg-card">
            {card.avatar_url ? (
              <img src={card.avatar_url} alt={card.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-display text-primary">
                {card.full_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-display font-bold text-foreground">{card.full_name}</h1>
            {card.job_title && <p className="text-primary font-medium">{card.job_title}</p>}
            {card.company && <p className="text-muted-foreground text-sm">{card.company}</p>}
          </div>

          {card.bio && (
            <p className="text-center text-sm text-muted-foreground max-w-xs">{card.bio}</p>
          )}
        </div>

        {/* Action Buttons */}
        <CardActionButtons card={card} appUrl={appUrl} />

        {/* Promos */}
        {promos.length > 0 && (
          <div className="space-y-3">
            {promos.map(promo => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}

        {/* QR Share */}
        <div className="flex flex-col items-center pt-4 pb-8">
          <QRDisplay url={publicUrl} size={120} showDownload={false} label="Share my card" />
        </div>

        {/* Branding */}
        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="gold-text font-semibold">VCARD·OS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
