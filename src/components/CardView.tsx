import { Card, CardLink } from '@/types/database';
import { Promo } from '@/types/database';
import { CardActionButtons } from '@/components/WalletButtons';
import { PromoCard } from '@/components/PromoCard';
import { QRDisplay } from '@/components/QRDisplay';
import { WalletCard } from '@/components/WalletCard';
import { getTheme } from '@/components/ThemePicker';
import { ExternalLink, ChevronRight } from 'lucide-react';

interface CardViewProps {
  card: Card;
  promos?: Promo[];
  links?: CardLink[];
  appUrl: string;
}

export function CardView({ card, promos = [], links = [], appUrl }: CardViewProps) {
  const publicUrl = `${appUrl}/${card.slug}`;
  const theme = getTheme(card.theme_color || 'dark');
  const isLight = ['white', 'coral', 'icici'].includes(card.theme_color);

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-8"
      style={{
        background: theme.gradient || theme.bg,
        color: theme.text,
      }}
    >
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Company Logo Banner */}
        {card.company_logo_url && (
          <div className="flex justify-center">
            <img src={card.company_logo_url} alt={card.company || 'Company'} className="h-10 w-auto object-contain" />
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-28 h-28 rounded-full border-[3px] overflow-hidden"
            style={{ borderColor: theme.accent, background: isLight ? '#f5f5f5' : 'rgba(255,255,255,0.1)' }}
          >
            {card.avatar_url ? (
              <img src={card.avatar_url} alt={card.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: theme.accent }}>
                {card.full_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{card.full_name}</h1>
            {card.job_title && <p className="font-medium" style={{ color: theme.accent }}>{card.job_title}</p>}
            {card.company && <p className="text-sm opacity-70">{card.company}</p>}
          </div>

          {card.bio && (
            <div
              className="rounded-xl p-4 max-w-xs text-center text-sm"
              style={{
                background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">About Me</h4>
              <p className="opacity-80">{card.bio}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <CardActionButtons card={card} appUrl={appUrl} />

        {/* Social Section */}
        {(card.linkedin || card.instagram || card.twitter || card.website) && (
          <div
            className="rounded-xl p-4"
            style={{
              background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60 text-center">Social</h4>
            <div className="flex justify-center gap-3">
              {card.linkedin && (
                <a href={card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: theme.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {card.instagram && (
                <a href={`https://instagram.com/${card.instagram.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: theme.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {card.twitter && (
                <a href={`https://x.com/${card.twitter.replace('@', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: theme.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {card.website && (
                <a href={card.website} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: theme.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Useful Links */}
        {links.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{
              background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Useful Links</h4>
            <p className="text-xs opacity-40 mb-3">Guide to Products & Features</p>
            <div className="space-y-1">
              {links.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:opacity-80"
                  style={{
                    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${theme.accent}20`, color: theme.accent }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{link.title}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {card.gallery_images && card.gallery_images.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{
              background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">Gallery</h4>
            <div className="grid grid-cols-2 gap-2">
              {card.gallery_images.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promos */}
        {promos.length > 0 && (
          <div className="space-y-3">
            {promos.map(promo => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}

        {/* Wallet-style Card */}
        <div
          className="rounded-xl p-4"
          style={{
            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60 text-center">Add to Wallet</h4>
          <WalletCard card={card} appUrl={appUrl} />
        </div>

        {/* QR Share */}
        <div className="flex flex-col items-center pt-4 pb-8">
          <QRDisplay url={publicUrl} size={120} showDownload={false} label="Share my card" />
        </div>

        {/* Branding */}
        <div className="text-center pb-6">
          <p className="text-xs opacity-40">
            Powered by <span className="font-semibold" style={{ color: theme.accent }}>VCARD·OS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
